####实现了*和:的路由模块
^
var config={
	'/home/:cat/:id':function(param){
		console.log(param.cat);//s001
		console.log(param.id);//g001
	},
	'/home/:cat/*:':function(param){
		console.log(param.cat);//s001
	}
}

RouteModule(config,'/home/s001/g001');

^