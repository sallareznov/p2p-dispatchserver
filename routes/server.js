var express = require('express');
var router = express.Router();
var request = require('request');

var bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('model/dal/serveurs.db');

router.get('/isalive', function(req, res) {
	var sum = (parseInt(req.headers['num1']) + parseInt(req.headers['num2']));
	console.log('test server sum: '+sum);
	res.header('sum', sum);
	res.sendStatus(200);
});


/* GET users listing. */
router.get('/', function(req, res) {

     db.serialize(function() {

         var rowTable = [];

         db.each("SELECT author, ip, createTime FROM serveurs order by createTime asc", function(err, row) {
            var httpip = 'http://'+row.ip
            rowTable.push({
            	author:row.author, 
            	ip:httpip,
            	ctime:row.createTime
            });
         }, function() {
             res.render('serveurs', {
                 title: 'Online serveurs',
                 data: rowTable
             });
         });
     });
});

router.post('/', function(req, res) {

    var vauthor = req.body.author;
    var vip = req.body.ip;
    var testip = 'http://'+vip+'/server/isalive';

    console.log('author: '+vauthor);
    console.log('ip: '+vip);
    console.log('testip: '+testip);

    var num1 = parseInt((Math.floor(Math.random() * 100) + 1));
	var num2 = parseInt((Math.floor(Math.random() * 100) + 1));
	var sum = (parseInt(num1)+parseInt(num2));

    var options = {
	  url: testip,
	  headers: {
	    'num1': num1,
	    'num2': num2
	  	}
	};
	
	var errorm = function(error) {
		res.render('error', {
            message: 'Le code retour de votre serveur n est pas ok', 
			description: 'Cette entrée n est pas possible pour le serveur. Peut-être cette IP est déjà entrée.',
            error: error
        });
    }				


	var callback = function(error, response, body) {
    	
		console.log('body: '+ body);

		if (!error && response.statusCode == 200) {

    		console.log('sum envoyé = '+sum);
    		console.log('sum return = '+response.headers['sum']);

    		if (response.headers['sum'] == sum) {

		  		console.log('test du serveur ok');
				
				db.serialize(function() {
		    	    
		    	    var stmt = db.prepare("INSERT INTO serveurs (author, ip) VALUES (?, ?)");
		    	    stmt.run(vauthor,vip, errorm);
		    	    
		    	    stmt.finalize(errorm);
		    	    /*function(error) {
						res.render('error', {
				            message: 'Le code retour de votre serveur n est pas ok', 
							description: 'Cette entrée nest pas possible pour le serveur. Peut-être cette IP est déjà entrée.',
				            error: error
				        });	
		    	    });*/

		    	}, errorm);


		    	/*function(error) {
		    		console.log('test du serveur ko');
		    	    res.render('error', {
		    	        message: 'une erreur s est produite lors de l ajout de votre serveur :(', 
						description: 'L adresse d un serveur ne peut etre ajoute qu une fois. Aussi, lors de l ajout d un serveur, le dispatch serveur envoie la requete suivante a votre serveur :<br><b>GET http://x.x.x.x/server/isalive</b><br>avec deux arguments dans le header, <b>num1</b> et <b>num2</b>.<br> Il faut que votre serveur renvoie un <b>status 200</b> à cette requete ainsi qu un parametre <b>sum</b> dans le header egale a <b>la somme de num1 et de num2</b>.<br><br>Courage !',
			    	    error: error
		    	    });
		    	});*/

	    	    res.render('success', {
	    	        message: 'Bravo!', 
					description: 'Ton serveur a correctement passe le test et est maintenant disponible pour tous :)<br>Tu peux rendre disponible les ressources qui te plaisent a travers différentes routes.<br>Noublie pas que les ressources mises a disposition sont accibles par tout le monde, alors troll bien ;)<br><br>Bon amusement !'
	    	    });	

			} else {
		        res.render('error', {
		            message: 'Le code retour de votre serveur n est pas ok', 
					description: 'L adresse d un serveur ne peut etre ajoute qu une fois. Aussi, lors de l ajout d un serveur, le dispatch serveur envoie la requete suivante a votre serveur :<br><b>GET http://x.x.x.x/server/isalive</b><br>avec deux arguments dans le header, <b>num1</b> et <b>num2</b>.<br> Il faut que votre serveur renvoie un <b>status 200</b> à cette requete ainsi qu un parametre <b>sum</b> dans le header egale a <b>la somme de num1 et de num2</b>.<br><br>INFO: Votre serveur ne renvoie pas la bonne somme.<br><br>Courage !',
		            error: error
		        });					
			}

		} else {
	        res.render('error', {
	            message: 'Votre serveur ne tourne pas rond :(', 
				description: 'L adresse d un serveur ne peut etre ajoute qu une fois. Aussi, lors de l ajout d un serveur, le dispatch serveur envoie la requete suivante a votre serveur :<br><b>GET http://x.x.x.x/server/isalive</b><br>avec deux arguments dans le header, <b>num1</b> et <b>num2</b>.<br> Il faut que votre serveur renvoie un <b>status 200</b> à cette requete ainsi qu un parametre <b>sum</b> dans le header egale a <b>la somme de num1 et de num2</b>.<br><br>INFO: Votre serveur ne répond pas à la requête de test<br><br>Courage !',
	            error: error
	        });	  
    	}
	};

	request(options, callback);

});


module.exports = router;
