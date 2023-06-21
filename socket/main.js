const { on } = require('events');
const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const port = process.env.PORT || 10000;

//serveur http attaché
const io = require('socket.io')(http);

//Variables de joueurs
let connectedUsers = [];
let gameEnded = false;
let gameStarted = false;
let responsesAmount = 0;
let motsEcrits = [];
let complices = [];
let complicesServer = [];
let amountOfVoted = 0;
let gameWon = false;


//themes 
const marquesDeVoiture = [];

//selecteur de mot
function chooseWord() {
    let x = Math.floor(Math.random() * marquesDeVoiture.length);
    let wordChosen = marquesDeVoiture[x];
    return wordChosen;
}

const themes = ["Citroen, Peugeot, Mercedes, Toyota, Ferrari", 
"Pomme, Poire, Pêche, Abricot, Orange, Banane", 
"Wii U, Nintendo switch, Xbox One, NES, PS4, PS5, Gameboy",
"France, Allemagne, Italie, Danemark, Belgique, Suisse",
"Rouge, Bleu, Jaune, Vert, Orange, Violet, Blanc, Noir",
"Chien, Chat, Cheval, Oiseau, Poisson, Lapin, Hamster",
"Montagne, Plage, Forêt, Désert, Île, Vallée, Lac",
"Pizza, Hamburger, Sushi, Pâtes, Salade, Crêpe, Glace",
"Mathématiques, Physique, Chimie, Biologie, Histoire, Géographie",
"Livre, Stylo, Cahier, Crayon, Gomme, Règle, Feuille",
"Musique, Danse, Peinture, Théâtre, Cinéma, Littérature",
"Football, Tennis, Basket-ball, Natation, Rugby, Volley-ball",
"Avion, Bateau, Voiture, Train, Vélo, Moto, Camion",
"Ordinateur, Téléphone, Tablette, Télévision, Appareil photo, Console de jeu",
"Lion, Tigre, Éléphant, Girafe, Zèbre, Singe, Kangourou",
"Printemps, Été, Automne, Hiver, Matin, Après-midi, Soir",
"Famille, Amis, Amour, Travail, Études, Loisirs, Voyage",
"Café, Thé, Jus d'orange, Eau, Limonade, Lait, Vin",
"Superman, Batman, Spiderman, Wonder Woman, Iron Man, Captain America",
"Guitare, Piano, Batterie, Violon, Flûte, Saxophone, Trompette",
"École, Université, Étudiant, Professeur, Cours, Examen, Diplôme",
"Étoile, Lune, Soleil, Planète, Galaxie, Astéroïde, Comète",
"Amérique, Europe, Asie, Afrique, Océanie, Antarctique",
"Lion, Tigre, Éléphant, Girafe, Zèbre, Singe, Kangourou",
"Printemps, Été, Automne, Hiver, Matin, Après-midi, Soir",
"Famille, Amis, Amour, Travail, Études, Loisirs, Voyage",
"Café, Thé, Jus d'orange, Eau, Limonade, Lait, Vin",
"Superman, Batman, Spiderman, Wonder Woman, Iron Man, Captain America",
"Guitare, Piano, Batterie, Violon, Flûte, Saxophone, Trompette",
"École, Université, Étudiant, Professeur, Cours, Examen, Diplôme",
"Étoile, Lune, Soleil, Planète, Galaxie, Astéroïde, Comète",
"Amérique, Europe, Asie, Afrique, Océanie, Antarctique",
"Piano, Violoncelle, Harpe, Trombone, Accordéon, Clarinette, Flûte traversière",
"Chevalier, Princesse, Dragon, Sorcier, Licorne, Fée, Château",
"Train, Métro, Tramway, Bus, Taxi, Avion, Vélo",
"Photo, Peinture, Sculpture, Gravure, Installation, Dessin, Vidéo",
"Robe, Pantalon, Chemise, Jupe, T-shirt, Veste, Chaussures",
"Théâtre, Comédie, Drame, Tragédie, Opéra, Ballet, Spectacle",
"Gardien de but, Défenseur, Milieu de terrain, Attaquant, Entraîneur, Arbitre, Supporter",
"Cuisine, Salle de bains, Chambre, Salon, Bureau, Jardin, Garage",
"Ours, Girafe, Lion, Singe, Éléphant, Zèbre, Tigre",]


//mélangeur de array
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }


//créer une nouvelle connexion
io.on('connection', socket =>{
    console.log(`${socket.id} connected`);
    // connectedUsers += socket.id;
    // io.emit("updatedUserList", connectedUsers);

    socket.on('disconnect', () =>{
        console.log(`${socket.id} disconnected`)
    });

    socket.on("message", msg => {
        console.log(`Message de la part de ${socket.id} :` + msg);
    });

    socket.on("pseudoNewUser", text => {
        connectedUsers.push(text);
        io.emit("updatedUserList", connectedUsers);
        console.log("la liste est maintenant : " + connectedUsers);

    });

    //commencer une game
    socket.on("startGame", launcher => {
        console.log("game is starting");
        let usersShuffled = shuffle(connectedUsers);
        console.log("nouvelle liste : " + usersShuffled);
        let themeShuffled = shuffle(themes);
        console.log("nouvelle liste de voitures : " + themeShuffled);
        let themeChoosedSplited = themes[0].split(", ");
        let themeDistribuable = shuffle(themeChoosedSplited)
        
        //distribution des mots
        for (user in usersShuffled) {
            console.log("au tour de " + user + "de recevoir son mot");
            
            io.emit("newWord", usersShuffled[user] + "|" + themeDistribuable[user]);
        }
        io.emit("newWord", usersShuffled[0] + "|" + themeDistribuable[1]);
        complices = [usersShuffled[0] + "|" + usersShuffled[1]];
        complicesServer.push(usersShuffled[0]);
        complicesServer.push(usersShuffled[1]);
        complicesServer.sort();
        console.log("Les complices sont : " + complices);
        gameStarted = true;

        
        io.emit("compose", "msg");

        

    });
    //reception des mots
    socket.on("Composed", motID => {
        motsEcrits.push(motID);
        console.log("Nouveau mot : " + motID)
        responsesAmount = motsEcrits.length;
        console.log(motsEcrits.length + " réponses ont été données")
        //si on a toutes les réponses, on anvoie au client de voter
        if (responsesAmount == connectedUsers.length) {
            console.log("Tous les joueurs ont répondus, lancement de la phase de vote");
            io.emit("Vote", motsEcrits);
        } else {
            console.log(motsEcrits.length + " joueurs ont répondu sur " + connectedUsers.length);
        }
        
    }


    )

    // function selectTheme() {
        
    // }
    socket.on("voteConfirmed", voteList => {
        voteList.sort();

        console.log(voteList)
        console.log(complicesServer)

        let strVoteList = voteList.toString();
        let strComplicesServeur = complicesServer.toString();

        amountOfVoted += 1;

        if (strVoteList == strComplicesServeur) {
            console.log("quelqu'un a gagné")
            gameWon = true
        } else {
            console.log("quelqu'un a perdu")
        }
        
        if (amountOfVoted == connectedUsers.length) {
            console.log("fin du vote");
            if (gameWon) {
                io.emit("gameEnded", "winner");
            } else {
                io.emit("compose", "msg");
                responsesAmount = 0;
                motsEcrits = [];
                amountOfVoted = 0;
            }

        }
    });

    socket.emit("server", "Voila un message du serv");
})


//route
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname, 'src/index.html'))
    res.sendFile(path.join(__dirname, 'src/style.css'))
})

http.listen(port,() => {
    console.log(`App listening on port ${port}`);
});

