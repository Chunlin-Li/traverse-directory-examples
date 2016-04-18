traverse directory examples
=================

对于多数开发者来说, 对于同步编程模型比较熟悉, 而且同步模型和人们的直觉和思维习惯比较相符.   
JavaScript/Node.js 的异步编程模型一直以来都是被人们吐槽最多的地方.   

这里使用多种不同的异步编程方式来实现一个简单而经典的遍历目录的问题, 由此来达到学习和练习不同的异步编程方式的目的.

该问题中, 我们做了以下限定:

* 虽然 Node 中的 fs 中提供了同步的 API, 比如 lstatSync, readdirSync 等, 但出于性能和学习目的, 一律不使用同步 API



### [example 01](example_01/traverser.js)

这应该是最简单最原始的版本. 嵌套了多层的匿名回调函数, 并使用递归方式编写. 


### [example 02](example_02/traverser.js)

使用了非递归的方式, 广度优先遍历, 并且使用非嵌套的命名函数, 一定程度上缓解了代码的"横向嵌套", 改为"纵向扩展", 并且用于回调的函数可以在多个位置复用 


### [example 03](example_03/traverser.js)

使用事件模型的方案, 不再直接调用函数了. 并且对外提供的 API 也是事件形式的.


### [example 04](example_04/traverser.js)

使用 Promise 的方案.
由于 Promise 的状态转换只有一次, 不能像回调或事件一样多次调用, 因此这个例子中, 调用后直接返回一个包含所有文件路径的数组.
我自己对 Promise 并不是非常熟悉, 因此这个例子感觉写的并不怎么样. 求指点.
另外, 最后做了个 Promise API 到 Callback API 的转换. 如果再加一些参数重载的处理, 可以合并到一起, 这样就可以兼容两种不同的调用方式了.


### [example 05](example_05/traverser.js)

还是使用 Promise, 但用了 bluebird 的实现, 也用到了 promisify 的功能, 可以将 node 的内建库从 callback 转为 promise 的形式.   
另一方面, bluebird 的 promise 实现比 node 中 v8 native promise 实现的更好. 


### [example 06](example_06/traverser.js)

使用 ES6 中 generator 和 promise 结合的形式.    
代码中提供了 $P 和 simpleExecutor 两个工具函数的简易实现. 事实上业务代码全部都在 traverse 函数中.     
和之前的方案相比要, 业务逻辑要清晰一些. 对于 yield 错误处理方面, 这里是需要显式处理各个具体错误的, 主要因为实现的 simpleExecutor 为了兼容
各种 callback signature 的形式. 倘若只兼容 Node-style(就是 function(err, res) 形式的回调)的话, 也可以直接 reject.  





参考: 

https://spion.github.io/posts/analysis-generators-and-other-async-patterns-node.html
