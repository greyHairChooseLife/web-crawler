const {targets} = require('./Ceramics');


for(let i=0; i<targets.length; i++){
	if(targets[i].state !== `submitted`){
		if(targets[i].foundPage === undefined) console.log(`Page not found`, i)
		if(targets[i].foundUpdates === undefined) console.log(`Update not found`, i)
		if(targets[i].foundComments === undefined) console.log(`Comment not found`, i)
	}else{
		if(targets[i].foundPage === undefined) console.log(`Page not found`, i)
	}
}
