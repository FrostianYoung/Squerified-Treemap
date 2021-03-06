# Squerified-Treemap

## 数据描述和分析
### 数据描述
籍贯属性是文本数据，需要进行进一步处理划分成层级结构。
数据分析：
选择籍贯属性用来进行划分。参考明朝行政区划网，得到籍贯属性层级从高到低为：
直隶/布政使司/都司/卫所 + 府/直隶州/卫/直隶千户所 + 州/千户 + 县 + 乡 + 里
考虑到划分太过精细不适合进行可视化，省略掉县级以下的划分。
同时为了便于理解，将同名的布政司与卫所合并。
因此我们构造柱三层树结构：代称为省、府（直隶州）、县。

### 数据处理
使用Excel提取出籍贯信息，并进行补充和修正。
首先需要将数据中的错字、异体字、缺失信息补全，无法识别的乱码则以不明标记。
随后统计同籍贯数量，循环读出每行excel内容，并根据省、府、县的层级划分输出成树状结构，存储在data.json中。

## 算法的设计与分析
算法的实现参考Squarified Treemap论文
### 算法步骤
一、处理json数据，按value值从大到小排序。
二、进行等方树图划分。
根据论文中的描述，定义对象Rectangle代表每个节点node对应的矩形区域，构造节点并生成其属性，以start[x,y]代表矩形左上角坐标，以width, height代表矩形宽高。计算得出其最短边、面积等属性。
核心算法squarify(children,row,w)伪代码如下：

其意义为：如果最大长宽比变小，则在现有行添加矩形；否则要新起一行来添加矩形。
函数worst(row,w)用来计算最大长宽比。
函数layoutrow(row)用于分配矩形到行。
三、将计算好的节点存入对应层级的leaves数组。
四、通过drawTreemap函数进行矩形的绘制。

## 可视化结果描述
主界面即为等方树图可视化结果。
四个按钮提供四种功能，点击可以更改树图显示方式，分别代表：按省划分、按府划分、按县划分、是否显示文字。

### 发现
等方树图按照从大到小顺序进行排序时难以保持数据原本的顺序，不过在籍贯信息中数据原本的顺序对于结果并没有太大的影响。
如果value值划分过细，则生成的等方树图很难查看，可以考虑省略掉过小的value值，不进行进一步划分。
思考：等方树图是为了使划分出的结果近似于正方形，但如果在一个区域内同时存在一个大数据和许多极小数据，就会产生如图效果。这时过小的数据很难进行辨认。考虑可以进行等方树图的局部放大。

## 参考
明朝行政区划网：http://www.xzqh.org/old/lishi/12ming/00.htm

