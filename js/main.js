let _width = $(window).width();
let _height = $(window).height();
let width = _width;
let height = _height;

let data = null;
let data_file = "./data/data.json";

let fontFamily;

let groupBy = 2; 
let showText = 1;

document.getElementById('s').onclick = function (){
  document.getElementById('container').innerHTML="";
  groupBy = 0;
  main();
}
document.getElementById('f').onclick = function (){
  document.getElementById('container').innerHTML="";
  groupBy = 1;
  main();
}
document.getElementById('x').onclick = function (){
  document.getElementById('container').innerHTML="";
  groupBy = 2;
  main();
}
document.getElementById('show').onclick = function (){
  document.getElementById('container').innerHTML="";
  let obj = document.getElementById('show');
  if(showText == 1){
    showText = 0;
    obj.innerHTML='显示文字';
  }
  else {
    showText = 1;
    obj.innerHTML='不显示文字';
  }
  main();
}

function setUi() {
  // 设置字体
  let ua = navigator.userAgent.toLowerCase();
  fontFamily = "Khand-Regular";
  if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular";
  }
  d3.select("body").style("font-family", fontFamily);
}

function treemap(data, width, height) {
  // Simple Treemap
  // 输入：数据，画布宽高
  // 输出：叶节点的位置及大小

  // 补充非叶节点的数量信息
  
  function getValue(node) {
    if (node.children == null) return;
    let value = 0;
    for (let i in node.children) {
      let n = node.children[i];
      getValue(n);
      value += n.value;
    }
    node.value = value;
  }
  getValue(data);
  //console.log(typeof(data));
  
  function sortNodes(node) {
    if(node.children == null) return;
    for(let i in node.children){
      let n = node.children[i];
      sortNodes(n);
    }
    for(let i = 0; i<node.children.length-1 ; i++) {
      for(let j = 0; j<node.children.length-1-i; j++){
        let m = node.children[j];
        let n = node.children[j+1];
        if(m.value<n.value){
          node.children[j] = n;
          node.children[j+1] = m;
        }
      }
    }
  }
  sortNodes(data);
  //console.log(data);
  
  // 存放叶节点的数组
  let leaves = [];

  // 计算叶节点位置
  // 保留第一层信息，方便染色
  function calcPos(node, x, y, width, height, direction, parent) {
    //console.log(x, y, width, height);
    if (node.children == null) {
      let leaf = {
        name: node.name,
        value: node.value,
        x: x,
        y: y,
        width: width,
        height: height,
        parent: parent == -1 ? node.name : parent.name,
      };
      leaves.push(leaf);
      return;
    }

    // 比例尺
    let scale;
    // 横向
    if (direction == 1)
      scale = d3.scaleLinear().domain([0, node.value]).range([0, width]);
    // 纵向
    else scale = d3.scaleLinear().domain([0, node.value]).range([0, height]);

    let totValue = 0;
    for (let i in node.children) {
      let n = node.children[i];
      let value = n.value;
      if (direction == 1)
        calcPos(
          n,
          x + scale(totValue),
          y,
          scale(value),
          height,
          direction ^ 1,
          parent == -1 ? n : parent
        );
      else
        calcPos(
          n,
          x,
          y + scale(totValue),
          width,
          scale(value),
          direction ^ 1,
          parent == -1 ? n : parent
        );
      totValue += value;
    }
  }
  calcPos(data, 0, 0, width, height, 1, -1);

  return leaves;
}

function squarifiedTreemap(data, width, height){
  // Squarified Treemap
  // 输入：数据，画布宽高
  // 输出：叶节点的位置及大小

  // 补充非叶节点的数量信息
  function getValue(node) {
    if (node.children == null) return;
    let value = 0;
    for (let i in node.children) {
      let n = node.children[i];
      getValue(n);
      value += n.value;
    }
    node.value = value;
  }
  getValue(data);
  // 从大到小排序
  function sortNodes(node) {
    if(node.children == null) return;
    for(let i in node.children){
      let n = node.children[i];
      sortNodes(n);
    }
    for(let i = 0; i<node.children.length-1 ; i++) {
      for(let j = 0; j<node.children.length-1-i; j++){
        let m = node.children[j];
        let n = node.children[j+1];
        if(m.value<n.value){
          node.children[j] = n;
          node.children[j+1] = m;
        }
      }
    }
  }
  sortNodes(data);
  
  function sumArray(arr){
    return arr.reduce(function (prev, cur){
      return prev+cur;
    },0);
  }
  // 存放叶节点的数组
  let leaves = []; // s
  let leaves1 = []; // f
  let leaves2 = []; // x
  function Rectangle(node, x,y,w, h, parent){
    console.log('node',node)
    this.node = node;
    this.name = node.name; // 名字
    this.value = node.value;// 值
    this.children = [];// 子节点
    this.w = w;// 宽
    this.h = h;// 高
    this.parent = parent; // 父矩形所在节点

    this.data = [];// 根据面积调整的数据，使其与屏幕宽高对应。
    this.start = [x,y];// 矩形左上角坐标
    this.areas = [];// 子矩形区域

    this.moveTo = [x, y];// 下一个矩形左上角
    this.area = 0;// 矩形面积

    if(this.w > this.h){// 横向
      this.direction = 1;
      this.lastSide = this.h;
      this.longSide = this.w;
    }
    else {// 纵向
      this.direction = 0;
      this.lastSide = this.w;
      this.longSide = this.h;
    }
    if(node.children){// 如果有子节点，调整
      this.children = node.children;
      let c = [];
      let slice = this.w * this.h / this.value;
      this.children.forEach(function (n, idx){// 分配面积
        c.push(n.value * slice);
      });
      this.data = c;// 调整后子节点对应的面积列表
    }
    else {
      let leaf = {
        name: this.name,
        value: this.value,
        x: this.start[0],
        y: this.start[1],
        width: this.w,
        height: this.h,
        parent: this.parent == -1 ? this.name : this.parent.name,
      };
      console.log('leaf',leaf);
      leaves2.push(leaf);
    }
  };
  Rectangle.prototype.width = function(){//子矩形的短边
    if(this.area == 0) return this.lastSide;
    let result = this.longSide - this.area / this.lastSide; //减去子矩形边长
    this.longSide = this.lastSide;
    this.lastSide = result;
    return result;
  };
  Rectangle.prototype.squarify = function(children,row,w){
    if(children.length == 0){
      this.layoutrow(row);
      return;
    }
    let c =children[0];
    if(row.length == 0 || this.worst(row,w) >= this.worst(row.concat(c),w)){// 现有行添加c
      this.squarify(children.slice(1, children.length), row.concat(c), w);
    }
    else {// 添加新行
      this.layoutrow(row);
      this.squarify(children,[],this.width());
    }
  };
  Rectangle.prototype.worst = function(row, w){// 计算最大长宽比
    let [...r] = row;
    if(r.length == 0) return Infinity;
    r.sort();
    let max = r[r.length-1];
    let min = r[0];
    let s = sumArray(r);
    return Math.max((w*w*max)/(s*s),(s*s)/(w*w*min));
  };
  Rectangle.prototype.layoutrow = function(row){//将完成layout的行放入矩形里，并添加进leaves列表
    this.area = sumArray(row);
    this.direction ^= 1;
    if(this.direction == 1){ // 横向
      let h = this.area / this.lastSide;
      let x = this.moveTo[0];
      for(let i = 0 ; i < row.length ; i ++){// 按行遍历
        let w = row[i]/h;
        let y = this.moveTo[1];
        let child = this.children[this.areas.length];
        let rec = new Rectangle(child,x,y,w,h,this);
        if(child.children){
          rec.squarify(rec.data, [], rec.width());
          let leaf = {
            name: this.name,
            value: this.value,
            x: this.start[0],
            y: this.start[1],
            width: this.w,
            height: this.h,
            parent: this.parent == -1 ? this.name : this.parent.name,
          };
          console.log('leaf',leaf);
          if(this.parent!=-1) leaves.push(leaf);
        }
        else {
          let leaf = {
            name: this.name,
            value: this.value,
            x: this.start[0],
            y: this.start[1],
            width: this.w,
            height: this.h,
            parent: this.parent == -1 ? this.name : this.parent.name,
          };
          console.log('leaf',leaf);
          leaves1.push(leaf);
        }
        this.areas.push(rec);
        x+=w;
      }
      this.moveTo = [this.moveTo[0],this.moveTo[1]+h];
    }
    else{
      let w = this.area / this.lastSide;
      let y = this.moveTo[1];
      for(let i = 0 ; i < row.length ; i ++){
        let h = row[i]/w;
        let x = this.moveTo[0];
        let child = this.children[this.areas.length];
        let rec = new Rectangle(child,x,y,w,h,this);
        if(child.children){
          rec.squarify(rec.data, [], rec.width());
          let leaf = {
            name: this.name,
            value: this.value,
            x: this.start[0],
            y: this.start[1],
            width: this.w,
            height: this.h,
            parent: this.parent == -1 ? this.name : this.parent.name,
          };
          console.log('leaf',leaf);
          if(this.parent!=-1) leaves.push(leaf);
        }
        else{
          let leaf = {
            name: this.name,
            value: this.value,
            x: this.start[0],
            y: this.start[1],
            width: this.w,
            height: this.h,
            parent: this.parent == -1 ? this.name : this.parent.name,
          };
          console.log('leaf',leaf);
          leaves1.push(leaf);
        }
        this.areas.push(rec);
        y+=h;
      }
      this.moveTo = [this.moveTo[0]+w, this.moveTo[1]];
    }
  }

  let rec = new Rectangle(data, 0, 0, width, height, -1);
  rec.squarify(rec.data,[],rec.width());

  //console.log(leaves);

  if(groupBy == 0) return leaves;
  if(groupBy == 1) return leaves1;
  if(groupBy == 2) return leaves2;
}

function drawTreemap() {
  // 计算布局
  console.log(data);
  let leaves = squarifiedTreemap(data, width, height);
  console.log(leaves);

  // 绘制
  let svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 定义颜色比例尺
  let color = d3.scaleOrdinal(d3.schemeCategory10);

  const leaf = svg
    .selectAll("g")
    .data(leaves)
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // 矩形
    leaf
    .append("rect")
    .attr("id", (d) => d.name)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("fill", (d) => color(d.parent))
    .attr("fill-opacity", 0.6)
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height);

  // 文字
  if(showText){
    leaf
    .append("text")
    .selectAll("tspan")
    .data((d) => d.name.split(/(?=[A-Z][a-z])|\s+/g).concat(d.value))
    .join("tspan")
    .attr("x", 3)
    .attr(
      "y",
      (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
    )
    .attr("fill-opacity", (d, i, nodes) =>
      i === nodes.length - 1 ? 0.7 : null
    )
    .text((d) => d);
  }
}

function main() {
  d3.json(data_file).then(function (DATA) {
    setUi();
    data = DATA;
    drawTreemap();
  });
}

main();