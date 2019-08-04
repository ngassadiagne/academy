#!encoding=utf-8
from flask import Flask, render_template, request, flash, url_for, redirect,session,send_file, jsonify, abort
import os
import psycopg2 as psy
import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS

# pip install marshmallow-sqlalchemy
# pip install -U flask-cors

app = Flask(__name__) #permet de localiser les ressources cad les templates

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:babacar.basse@localhost/sonatel'
app.secret_key = 'some_secret'
db = SQLAlchemy(app)
ma = Marshmallow(app)

#######################table etudiant################################
class Etudiant(db.Model):
  __tablename__ = 'etudiant'
  id= db.Column(db.Integer, primary_key=True)
  matricule = db.Column(db.String(32), unique=True,nullable = False)
  prenom = db.Column(db.String(32),nullable = False)
  nom = db.Column(db.String(32),nullable = False)
  datenaissance = db.Column(db.String(32),nullable = False)
  lieunaissance = db.Column(db.String(32),nullable = False)
  email = db.Column(db.String(32), unique = True, nullable = False)
  telephone = db.Column(db.String(32), unique=True,nullable = False)
  adresse = db.Column(db.String(45), nullable = False)
  sexe = db.Column(db.String(15), nullable = False)
  def __init__(self, matricule, prenom, nom, datenaissance, lieunaissance, email, telephone, adresse, sexe):
    self.matricule =  matricule
    self.prenom = prenom
    self.nom = nom
    self.datenaissance = datenaissance
    self.lieunaissance = lieunaissance
    self.email = email
    self.telephone = telephone
    self.adresse = adresse
    self.sexe = sexe
  def __repr__(self):
    return '<Etudiant %r>'

class EtudiantSchema(ma.ModelSchema):
  class Meta:
    model = Etudiant
    sqla_session = db.session   

####################### table filiere###############################
class Filiere(db.Model):
  __tablename__ = 'filiere'
  id= db.Column(db.Integer, primary_key=True)
  libelle = db.Column(db.String(32), unique = True)
  def __init__(self,libelle):
    self.libelle = libelle
  def __repr__(self):
    return '<Filiere %r>'

class FiliereSchema(ma.ModelSchema):
  class Meta:
    model = Filiere
    sqla_session = db.session    

####################### table classe################################       
class Classe(db.Model):
  __tablename__ = 'classe'
  id= db.Column(db.Integer, primary_key=True)
  libelle = db.Column(db.String(32), unique = True)
  montantinscription = db.Column(db.Integer)
  mensualite = db.Column(db.Integer)
  filiere = db.Column(db.Integer, db.ForeignKey('filiere.id'))
  def __init__(self, libelle, montantinscription, mensualite, filiere):
    self.libelle = libelle
    self.montantinscription = montantinscription
    self.mensualite =  mensualite
    self.filiere =  filiere
  def __repr__(self):
    return '<Classe %r>'

class ClasseSchema(ma.ModelSchema):
  class Meta:
    model = Classe
    sqla_session = db.session   

#######################table inscription###########################       
class Inscription(db.Model):
  __tablename__ = 'inscription'
  id= db.Column(db.Integer, primary_key=True)
  anneeacademique = db.Column(db.String(32))
  dateinscription = db.Column(db.String(32))
  etudiant = db.Column(db.Integer, db.ForeignKey('etudiant.id')) 
  classe = db.Column(db.Integer, db.ForeignKey('classe.id'))
  def __init__(self, anneeacademique, dateinscription, etudiant, classe):
    self.anneeacademique = anneeacademique
    self.dateinscription = dateinscription
    self.etudiant = etudiant
    self.classe = classe
  def __repr__(self):
    return '<Inscription %r>'

class InscriptionSchema(ma.ModelSchema):
  class Meta:
    model = Inscription
    sqla_session = db.session   

@app.route('/filieres')
def listFilieres():
  filieres = Filiere.query.all()
  filiere_schema = FiliereSchema(many=True)
  return jsonify({'filieres': filiere_schema.dump(filieres).data})

@app.route('/filieres', methods = ['POST'])
def addNewFiliere():
  filiere_schema = FiliereSchema()
  body = request.json
  libelle = body['libelle']

  existing_filiere = Filiere.query \
    .filter(Filiere.libelle == libelle) \
    .one_or_none()
  if existing_filiere is not None:
    return 'libelle filiere is already used'
  
  filiere = Filiere(libelle)
  db.session.add(filiere)
  db.session().commit()
  return jsonify({"data": filiere_schema.dump(filiere).data})

@app.route('/classes')
def listClasses():
  classes = db.session.query(Classe, Filiere).with_entities(Classe.id, Classe.libelle, Classe.mensualite, Classe.montantinscription, Filiere.id).outerjoin(Filiere, Filiere.id == Classe.filiere).all()
  _classes = []
  for classe in classes:
    _classes.append({"id": classe[0], "libelle": classe[1], "mensualite": classe[2], "montantinscription": classe[3], "filiere": classe[4]})
  return jsonify({'classes': _classes})

@app.route('/classes', methods = ['POST'])
def addNewClasse():
  class_schema = ClasseSchema()
  body = request.json
  libelle = body['libelle']
  montantinscription = body['montantinscription']
  mensualite = body['mensualite']
  filiere = body['filiere']
  existing_classe = Classe.query \
    .filter(Classe.libelle == libelle) \
    .one_or_none()
  if existing_classe is not None:
    return 'libelle classe is already used'

  classe = Classe(libelle, montantinscription, mensualite, filiere)
  db.session.add(classe)
  db.session().commit()
  return jsonify({"data": class_schema.dump(classe).data})

@app.route('/inscriptions')
def listInscription():
  inscriptions = Inscription.query.all()
  inscription_schema = InscriptionSchema(many=True)
  return jsonify({'inscriptions': inscription_schema.dump(inscriptions).data})

@app.route('/inscriptions', methods = ['POST'])
def addNewInscription():
  inscription_schema = InscriptionSchema()
  etudiant_schema = InscriptionSchema()
  body = request.json
  matricule = body['matricule']
  prenom = body['prenom']
  nom = body['nom']
  datenaissance = body['datenaissance']
  lieunaissance = body['lieunaissance']
  email = body['email']
  telephone = body['telephone']
  adresse = body['adresse']
  sexe = body['sexe']

  existing_email = Etudiant.query \
    .filter(Etudiant.email == email) \
    .one_or_none()
  if existing_email is not None:
    return 'email is already used'

  existing_telephone = Etudiant.query \
    .filter(Etudiant.telephone == telephone) \
    .one_or_none()
  if existing_telephone is not None:
    return 'telephone is already used'

  existing_matricule = Etudiant.query \
    .filter(Etudiant.matricule == matricule) \
    .one_or_none()
  if existing_matricule is not None:
    return 'matricule is already used'

  etudiant = Etudiant(matricule, prenom, nom, datenaissance, lieunaissance, email, telephone, adresse, sexe)
  db.session.add(etudiant)
  db.session().commit()
  etudiant = etudiant_schema.dump(etudiant).data
  anneeacademique = body['anneeacademique']
  dateinscription = body['dateinscription']
  classe = body['classe']
  inscription = Inscription(anneeacademique, dateinscription, etudiant['id'], classe)
  db.session.add(inscription)
  db.session().commit()
  return jsonify({"data": inscription_schema.dump(inscription).data})

@app.route('/etudiants/:matricule')
def getEtudiant(matricule):
  etudiant = Etudiant.query \
    .filter(Etudiant.matricule == matricule) \
    .one_or_none()
  etudiant_schema = EtudiantSchema()
  return jsonify({'inscriptions': etudiant_schema.dump(etudiant).data})

#***********************************************************************************************
if __name__ == '__main__': #si le fichier est executer alors execute le bloc
    app.run(debug=True) #debug=True relance le serveur à chaque modification


