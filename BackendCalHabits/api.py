from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS from flask_cors
from connection import connect_to_snowflake, execute_query
import os
from langchain.prompts import PromptTemplate
from langchain.llms import openai
from langchain.chains import LLMChain
import openai
import re 
# from langchain.embeddings import FakeEmbeddings
import  numpy as np
import faiss
from PIL import Image
from pytesseract import pytesseract
path=r"C:\Program Files\Tesseract-OCR\tesseract.exe"



app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in the app

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Extract user data from the JSON request
    email = data['email']
    password = data['password']
    full_name = data['full_name']
    height = data.get('height', None)
    weight = data.get('weight', None)
    age = data.get('age', None)
    gender = data.get('gender', None)
    goal = data.get('goal', None)
    weight_goal = data.get('weightGoal', None)
    activity_level= data.get('activityLevel', None)

    # Establish a connection to the Snowflake database
    conn = connect_to_snowflake()
    cursor = conn.cursor()

    try:
        # Check if the user already exists
        user_exists_query = f"SELECT * FROM MYCALHABITS.PUBLIC.USERS WHERE EMAIL = '{email}'"
        cursor.execute(user_exists_query)
        result = cursor.fetchone()


        if result:
            return jsonify({'message': 'User with this email already exists. Please login.'}), 400

        # If the user does not exist, proceed with the insertion
        query = f"""
            INSERT INTO MYCALHABITS.PUBLIC.USERS 
            (EMAIL, PASSWORD, FULL_NAME, HEIGHT, WEIGHT, AGE, GENDER, GOAL, WEIGHT_GOAL, ACTIVITY_LEVEL) 
            VALUES 
            ('{email}', '{password}', '{full_name}', {height}, {weight}, '{age}', '{gender}', '{goal}', '{weight_goal}', '{activity_level}')
        """
        print(f"SQL Query: {query}")

        # Insert the user data into the Snowflake table
        execute_query(conn, query)

        return jsonify({'message': 'Success'}), 200
    except Exception as e:
        # Print the exception details for debugging purposes
        print(f"Error: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500
    finally:
        # Close the database connection
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        print(f"Email recu: {email}")

        # Establish a connection to the Snowflake database
        conn = connect_to_snowflake()
        cursor = conn.cursor()

        try:
            # Retrieve user data from the database
            query = f"SELECT * FROM MYCALHABITS.PUBLIC.USERS WHERE EMAIL = '{email}' AND PASSWORD = '{password}'"
            cursor.execute(query)
            result = cursor.fetchone()

            if result:
                print("User exists.")
                user_data = {
                    'email': result[1],
                    'password': result[2],
                    'full_name': result[3],
                    'height': result[4],
                    'weight': result[5],
                    'age': result[6],
                    'gender': result[7],
                    'goal': result[8],
                    'weight_goal': result[9],
                    'activity_level': result[10],
                }
                
                # Send each element separately in the JSON response
                response_data = {f'{key}': value for key, value in user_data.items()}
    
                print("Data:", response_data)
                return jsonify({'user_data': response_data, 'message': 'Données reçues avec succès'})
                
            else:
                # Si l'utilisateur n'existe pas, renvoyez un message d'erreur à React
                return jsonify({'message': 'Utilisateur non trouvé'}), 404
        except Exception as e:
            print(f"Error: {str(e)}")
            response = {'message': f'Erreur lors de la connexion'}
            return jsonify(response), 500
    finally:
        conn.close()


@app.route('/getUserData', methods=['POST'])
def get_user_data():
    data = request.get_json()
    email = data.get('email')
    print(f'Email received: {email}')

    conn = connect_to_snowflake()
    cursor = conn.cursor()

    try:
        # Retrieve user data from the database
        query = f"SELECT * FROM MYCALHABITS.PUBLIC.USERS WHERE EMAIL = '{email}'"
        cursor.execute(query)
        result = cursor.fetchone()

        if result:
            print("User exists.")
            user_data = {
                'email': result[1],
                'password': result[2],
                'full_name': result[3],
                'height': result[4],
                'weight': result[5],
                'age': result[6],
                'gender': result[7],
                'goal': result[8],
                'weight_goal': result[9],
                'activity_level': result[10],
            }

            # Send each element separately in the JSON response
            response_data = {f'{key}': value for key, value in user_data.items()}

            print("Data:", response_data)
            
            # Return each element separately in the JSON response
            return jsonify({'email': response_data['email'],
                            'full_name': response_data['full_name'],
                            'height': response_data['height'],
                            'weight': response_data['weight'],
                            'age': response_data['age'],
                            'gender': response_data['gender'],
                            'goal': response_data['goal'],
                            'weight_goal': response_data['weight_goal'],
                            'activity_level': response_data['activity_level'],
                            'message': 'Données reçues avec succès'})
        else:
            # Si l'utilisateur n'existe pas, renvoyez un message d'erreur à React
            return jsonify({'message': 'Utilisateur non trouvé'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        response = {'message': f'Erreur lors de la connexion'}
        return jsonify(response), 500
    finally:
        conn.close()


        
@app.route('/updateUserInfo', methods=['POST'])
def update():
    data = request.get_json()
    user_email = data.get('email')  # Assuming 'email' is unique per user

    # Establish database connection
    conn = connect_to_snowflake()
    cursor = conn.cursor()

    try:
        # Prepare the data for update
        updated_data = {
            'password': data['password'],  # This should be hashed
            'full_name': data['full_name'],
            'height': data['height'],
            'weight': data['weight'],
            'age': data['age'],
            'gender': data['gender'],
            'goal': data['goal'],
            'weight_goal': data['weightGoal'],  # Make sure this matches with React's 'weightGoal'
            'activity_level': data['activityLevel'],  # Make sure this matches with React's 'activityLevel'
        }

        # Create the update statement dynamically
        update_setters = ', '.join([f"{key}=%s" for key in updated_data.keys()])
        values = list(updated_data.values()) + [user_email]

        query = f"""
            UPDATE MYCALHABITS.PUBLIC.USERS
            SET {update_setters}
            WHERE EMAIL=%s
        """

        # Execute the update query
        cursor.execute(query, values)
        conn.commit()
        print()
        return jsonify({'message': 'Infos updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        cursor.close()
        conn.close()
    
    
    



# the API key assignment
openai.api_key = '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'

class OpenAICompletionRunnable:
    def __init__(self, completion_instance):
        self.completion_instance = completion_instance

    def run(self, input_data):
        # Extract relevant information from user_responses
        # For simplicity,concatenate the 'additionalText' values
        user_text = ' '.join(item['additionalText'] for item in input_data)

        # Use the language model to generate recommendations
        response = self.completion_instance.create(
            engine="text-davinci-003",
            prompt=f"Diet & Workout Recommendation System:\nUser Input: {user_text}\nGenerate 5 recommendations for breakfast, 5 recommendations for dinner, and 5 recommendations for workout.",
            temperature=0.5,
            max_tokens=1005
        )

        # Extract the generated recommendations from the response
        recommendations = response['choices'][0]['text'].strip()

        return recommendations
    def run_resto(self, resto_data):
        # concatenation
        user_resto = ' '.join(item['Location'] for item in resto_data)

        response = self.completion_instance.create(
            engine="text-davinci-003",
            prompt=f"Restaurant Recommendation System:\nUser Resto: {user_resto}\nGenerate 5 recommendations for restaurants.",
            temperature=0.5,
            max_tokens=1005
        )
        resto_recommendations = response['choices'][0]['text'].strip()

        return resto_recommendations
class OpenAIResto:
    def __init__(self, completion_instance):
        self.completion_instance = completion_instance

    def run_resto(self, location, conditions):
        #Concatenation

        user_resto = f"Location: {location}, Conditions: {conditions}"

        response = self.completion_instance.create(
            engine="text-davinci-003",
            prompt=f"Restaurant Recommendation System:\nUser Resto: {user_resto}\nGenerate 5 recommendations for restaurants.",
            temperature=0.5,
            max_tokens=1005
        )
        resto_recommendations = response['choices'][0]['text'].strip()

        return resto_recommendations

class OpenAIPDF:
    def __init__(self, completion_instance):
        self.completion_instance = completion_instance

    def run_pdf(self, pdf_text):
        user_analyse = f"Location: {pdf_text}"

        response = self.completion_instance.create(
            engine="text-davinci-003",
            prompt=f"PDF ANALYZE HEALTH System:\nUser analyze: {user_analyse}\nExplain the analyze-health in the pdf (good or bad health) and generate 6 meals and 6 workouts recommendations only if the patient's health is bad if it's good just explain without any recommendations",
            temperature=0.5,
            max_tokens=1005
        )
        health_recommendations = response['choices'][0]['text'].strip()

        return health_recommendations    
class OpenAIIMG:
    def __init__(self, completion_instance):
        self.completion_instance = completion_instance

    def run_img(self, img_text):
        user_img = f"Text: {img_text}"

        response = self.completion_instance.create(
            engine="text-davinci-003",
            prompt=f"Image ANALYZE Ingredients System:\nUser image: {user_img}\nAnalyze the ingredients of the product and tell if it's good or bad for health and why",
            temperature=0.5,
            max_tokens=1005
        )
        health= response['choices'][0]['text'].strip()

        return health    


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_responses = data.get('responses', [])
    print(user_responses)

    # the openai object
    llm_resto = OpenAICompletionRunnable(openai.Completion)

    input_data = user_responses
    recommendations = llm_resto.run(input_data)
    print("Sent",recommendations)
    return jsonify({"Recs": recommendations})  
    
    

@app.route('/resto', methods=['POST'])
def resto():
    data = request.json
    location = data.get('location', '')
    conditions = data.get('conditions', [])

    
    print('Location:', location)
    print('Conditions:', conditions)
    
    llm_resto = OpenAIResto(openai.Completion())
    resto_recommendations = llm_resto.run_resto(location, conditions)
    print(resto_recommendations,"set saccusfully")

   
    return jsonify({"resto recommendations": resto_recommendations})

@app.route('/pdf', methods=['POST'])
def pdf():
    data = request.json
    pdf_text = data.get('pdfText')

    #les lignes du tableau sont séparées par des sauts de ligne
    lines = pdf_text.split('\n')

    # imprimer chaque ligne séparément
    for line in lines:
        print(line)

    # Analyse PDF avec OpenAI ou toute autre logique que vous avez
    llm_pdf = OpenAIPDF(openai.Completion())
    pdf_anal = llm_pdf.run_pdf(pdf_text)
    print(pdf_anal)

    # Retournez les résultats sous forme de JSON
    return jsonify({"pdfAnalysis": pdf_anal})  

@app.route('/image', methods=['POST'])
def image():
    if 'image' not in request.files:
        return {'error': 'No file part'}, 400

    file = request.files['image']
    print("Image uploaded successfully")
    pytesseract.tesseract_cmd =path
    img =Image.open(file)
    text = pytesseract.image_to_string(img)
    print(text)


    llm_pdf = OpenAIIMG(openai.Completion())
    img_anal = llm_pdf.run_img(text)
    print(img_anal)

    # Retournez les résultats sous forme de JSON
    return jsonify({"ImgAnalysis": img_anal})  

    
if __name__ == '__main__':
    # Set the host and port
    host = 'localhost'
    port = 5000

    print(f'Server is running on http://{host}:{port}')

    # Run the Flask application
    app.run(host=host, port=port, debug=True)