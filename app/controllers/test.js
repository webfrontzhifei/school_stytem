var userModel = require('../models/user.common.model.js');

function insert(){
	var user = new userModel( {
		name: 'david',
		password: '199151',
		age: 35
	});

	user.save(function(err, res) {
		if(err) {
			console.log('Error: '+err);
		}else {
			console.log('Res:'+res);
		}
	});
}

function update(){
	var wherestr = {'name': 'david'};
	var updatestr = {'password': '66666'};

	userModel.update(wherestr, updatestr, function(err, res) {
		if(err) {
			console.log("Error: "+err);
		}
		else {
			console.log("Res: "+res);
		}
	})
}

update();
	