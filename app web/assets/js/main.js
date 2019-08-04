listFilieres = [];
listClasses = [];
var select_filiere = document.getElementById('select_filiere');
var select_classe = document.getElementById('select_classe');
$(document).ready(function() {
  initialisation();
});

function initialisation() {
  input_matricule = document.getElementById('matricule');
  input_matricule.value = randomUniqueMatricule();
  initData();
  select_filiere.addEventListener('change', function() {
    var filiere = select_filiere.value;
    listClassesSelectedFiliere = [];
    listClasses.forEach(classe => {
      if (classe.filiere == filiere) {
        listClassesSelectedFiliere.push(classe);
      }
    });

    listClassesSelectedFiliere.forEach(function(classe) {
      console.log(classe);
    });
  });
}

function randomUniqueMatricule() {
  var date = new Date();
  var timestamp = date.getTime();
  var random1 = getRandomInt(9);
  var random2 = getRandomInt(99);
  var random3 = getRandomInt(999);
  return `${random1}${random2}-${timestamp}-${random3}`;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function initData() {
  $.get('http://localhost:5000/filieres', function(data) {
    listFilieres = data.filieres;
    // initialisation de la liste des filières
    listFilieres.forEach(option => {
      var elementOption = document.createElement('option');
      elementOption.textContent = option.libelle;
      elementOption.value = option.id;
      select_filiere.appendChild(elementOption);
    });
  });
  $.get('http://localhost:5000/classes', function(data) {
    listClasses = data.classes;
  });
}
