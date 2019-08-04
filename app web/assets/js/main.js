listFilieres = [];
listClasses = [];
var select_filiere = document.getElementById('select_filiere'),
  select_classe = document.getElementById('select_classe'),
  submitButton = document.getElementById('submitButton'),
  typeActionRadio = document.form.typeAction,
  input_prenom = document.getElementById('prenom'),
  input_nom = document.getElementById('nom'),
  select_sexe = document.getElementById('sexe'),
  input_matricule = document.getElementById('matricule'),
  input_datenaissance = document.getElementById('datenaissance'),
  input_lieunaissance = document.getElementById('lieunaissance'),
  input_email = document.getElementById('email'),
  input_telephone = document.getElementById('telephone'),
  input_adresse = document.getElementById('adresse'),
  input_anneeacademique = document.getElementById('anneeacademique'),
  input_dateinscription = document.getElementById('dateinscription'),
  input_montantinscription = document.getElementById('montantinscription'),
  input_mensualite = document.getElementById('mensualite'),
  input_total = document.getElementById('total');

$(document).ready(function() {
  initialisation();
});

function initialisation() {
  input_matricule = document.getElementById('matricule');
  input_matricule.value = randomUniqueMatricule();
  initData();
  events();
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
    listFilieres.forEach(function(filiere) {
      var elementOption = document.createElement('option');
      elementOption.textContent = filiere.libelle;
      elementOption.value = filiere.id;
      select_filiere.appendChild(elementOption);
    });
  });
  $.get('http://localhost:5000/classes', function(data) {
    listClasses = data.classes;
  });
}

function events() {
  // ecoute de l'evenement de changement du select filiere
  select_filiere.addEventListener('change', function() {
    var filiere = select_filiere.value;
    listClassesSelectedFiliere = [];
    listClasses.forEach(function(classe) {
      if (classe.filiere == filiere) {
        listClassesSelectedFiliere.push(classe);
      }
    });
    // vider la liste des options de classe
    $('#select_classe').empty();
    // on efface contenu des montants
    input_montantinscription.value = '';
    input_mensualite.value = '';
    input_total.value = '';
    var optionDefault = document.createElement('option');
    optionDefault.textContent = 'Choisir une classe';
    optionDefault.value = '';
    select_classe.append(optionDefault);
    listClassesSelectedFiliere.forEach(function(classe) {
      var elementOption = document.createElement('option');
      elementOption.textContent = classe.libelle;
      elementOption.value = classe.id;
      select_classe.appendChild(elementOption);
    });
  });

  // ecoute de l'evenement de changement du select classe
  select_classe.addEventListener('change', function() {
    var idClasse = select_classe.value;
    var classe;
    listClasses.forEach(function(_classe) {
      if (_classe.id == idClasse) {
        classe = _classe;
      }
    });
    input_montantinscription.value = classe.montantinscription;
    input_mensualite.value = classe.mensualite;
    input_total.value = classe.mensualite + classe.montantinscription;
  });

  // ecoute de l'evenement submit du formulaire
  submitButton.addEventListener('click', function() {
    var prenom = input_prenom.value,
      nom = input_nom.value,
      matricule = input_matricule.value,
      sexe = select_sexe.value,
      datenaissance = input_datenaissance.value,
      lieunaissance = input_lieunaissance.value,
      email = input_email.value,
      telephone = input_telephone.value,
      adresse = input_adresse.value,
      classe = select_classe.value,
      anneeacademique = input_anneeacademique.value,
      dateinscription = input_dateinscription.value;

    if (
      prenom &&
      nom &&
      matricule &&
      sexe &&
      datenaissance &&
      lieunaissance &&
      email &&
      telephone &&
      adresse &&
      classe &&
      anneeacademique &&
      dateinscription
    ) {
      var body = {
        matricule: matricule,
        prenom: prenom,
        nom: nom,
        datenaissance: datenaissance,
        lieunaissance: lieunaissance,
        email: email,
        telephone: telephone,
        adresse: adresse,
        classe: classe,
        anneeacademique: anneeacademique,
        dateinscription: dateinscription,
        sexe: sexe
      };
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/inscriptions',
        data: JSON.stringify(body),
        contentType: 'application/json',
        dateType: 'json',
        success: function() {
          window.location.reload();
        }
      });
    }
  });
}

// on ecoute le changement de type d'action (nouveau ou ancien)
var prev = null;
for (var i = 0; i < typeActionRadio.length; i++) {
  typeActionRadio[i].addEventListener('change', function() {
    if (this !== prev) {
      prev = this;
    }
    // si l'option ancien est choisi on disable le formulaire
    if (this.value == 'ancien') {
      actionAncienFormulaire();
    } else {
      actionNouveauFormulaire();
    }

    // desactivation du formulaire
    function actionAncienFormulaire() {
      input_prenom.setAttribute('disabled', 'disabled');
      input_nom.setAttribute('disabled', 'disabled');
      select_sexe.setAttribute('disabled', 'disabled');
      input_datenaissance.setAttribute('disabled', 'disabled');
      input_lieunaissance.setAttribute('disabled', 'disabled');
      input_email.setAttribute('disabled', 'disabled');
      input_telephone.setAttribute('disabled', 'disabled');
      input_adresse.setAttribute('disabled', 'disabled');
      input_matricule.removeAttribute('disabled');
      // disable form inscription
      select_filiere.setAttribute('disabled', 'disabled');
      select_classe.setAttribute('disabled', 'disabled');
      input_dateinscription.setAttribute('disabled', 'disabled');
      input_anneeacademique.setAttribute('disabled', 'disabled');
      submitButton.setAttribute('disabled', 'disabled');
      cleanFormulaire();
    }

    // activation du formulaire
    function actionNouveauFormulaire() {
      input_prenom.removeAttribute('disabled');
      input_nom.removeAttribute('disabled');
      select_sexe.removeAttribute('disabled');
      input_datenaissance.removeAttribute('disabled');
      input_lieunaissance.removeAttribute('disabled');
      input_email.removeAttribute('disabled');
      input_telephone.removeAttribute('disabled');
      input_adresse.removeAttribute('disabled');
      input_matricule.setAttribute('disabled', 'disabled');
      // disable form inscription
      select_filiere.removeAttribute('disabled');
      select_classe.removeAttribute('disabled');
      input_dateinscription.removeAttribute('disabled');
      input_anneeacademique.removeAttribute('disabled');
      submitButton.removeAttribute('disabled');
      cleanFormulaire();
      input_matricule.value = randomUniqueMatricule();
    }

    // efface donnees du formulaire
    function cleanFormulaire() {
      input_matricule.value = '';
      input_prenom.value = '';
      input_nom.value = '';
      select_sexe.value = '';
      input_datenaissance.value = '';
      input_lieunaissance.value = '';
      input_email.value = '';
      input_telephone.value = '';
      input_adresse.value = '';

      select_filiere.value = '';
      select_classe.value = '';
      input_montantinscription.value = '';
      input_mensualite.value = '';
      input_total.value = '';
      input_dateinscription.value = '';
      input_anneeacademique.value = '';
    }
  });
}

// recherche etudiant
function rechercheEtudiant() {
  var matricule = input_matricule.value;
  if (matricule) {
    $.get('http://localhost:5000/etudiants/' + matricule, function(data) {
      var etudiant = data.etudiant;
      // affichage des informations de l'etudiant
      input_prenom.value = etudiant.prenom;
      input_nom.value = etudiant.nom;
      select_sexe.value = etudiant.sexe;
      input_datenaissance.value = etudiant.datenaissance;
      input_lieunaissance.value = etudiant.lieunaissance;
      input_email.value = etudiant.email;
      input_telephone.value = etudiant.telephone;
      input_adresse.value = etudiant.adresse;
    });
  }
}
