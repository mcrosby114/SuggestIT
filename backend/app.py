from datetime import datetime

from db import Suggestion, suggestion_to_json
import config

from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from pony.orm import db_session, ObjectNotFound, commit

from weekmail import weekmail

app = Flask(__name__)
api = Api(app)

@db_session
def add_new_suggestion(title_inp, text_inp, author_inp):
    return Suggestion(timestamp=datetime.utcnow(), title=title_inp, text=text_inp, author=author_inp), 201


class SuggestionRes(Resource):
    @db_session
    def get(self, id):
        if request.headers.get('Authorization') != config.PRIT_AUTH_KEY:
            return 'You are not PRIT', 401

        return suggestion_to_json(Suggestion[id])

    @db_session
    def delete(self, id):
        if request.headers.get('Authorization') != config.PRIT_AUTH_KEY:
            return 'You are not PRIT', 401

        Suggestion[id].delete()


    @db_session
    def put(self, id):
        if request.headers.get('Authorization') != config.PRIT_AUTH_KEY:
            return 'You are not PRIT', 401

        try:
            suggestion = Suggestion[id]
            suggestion.title = request.json["title"]
            suggestion.text = request.json["text"]
            suggestion.author = request.json["author"]
            commit()
        except ObjectNotFound:
            add_new_suggestion(request.json["title"], request.json["text"], request.json["author"])


class SuggestionResList(Resource):
    @db_session
    def post(self):
        return suggestion_to_json(add_new_suggestion(request.json["title"], request.json["text"], request.json["author"]))


    @db_session
    def get(self):
        if request.headers.get('Authorization') != config.PRIT_AUTH_KEY:
            return 'You are not PRIT', 401

        return jsonify([suggestion_to_json(s) for s in Suggestion.select(lambda t : True)])

class Authentication(Resource):
    def put(self):
        if request.json["password"] == config.PRIT_PASSWORD:
            return jsonify(key=config.PRIT_AUTH_KEY)

        return "You are not PRIT", 401

    def get(self):
        if request.headers.get('Authorization') != config.PRIT_AUTH_KEY:
            return 'You are not PRIT', 401
        
        return 'You are PRIT', 200

api.add_resource(SuggestionRes, '/<string:id>')
api.add_resource(SuggestionResList, '/')
api.add_resource(Authentication, '/authenticate')

if __name__ == '__main__':
    #4 = friday, 17,0,0 = 17:00:00
    wm = weekmail(4,17,0,0)
    wm.start()
    print("Week mail loop has started")
    app.run(host='0.0.0.0')
