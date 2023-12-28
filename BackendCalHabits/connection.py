import snowflake.connector

def connect_to_snowflake():
    conn = snowflake.connector.connect(
        user='fatae',
        password='Fati2003.',
        account='ucvhnsn-oc78442',
        warehouse='COMPUTE_WH',
        database='MYCALHABITS',
        schema='PUBLIC'
    )
    return conn
def execute_query(conn, query):
    cursor = conn.cursor()
    cursor.execute(query)
    cursor.close()
    conn.close()
# import snowflake.connector

# def connect_to_snowflake():
#     try:
#         conn = snowflake.connector.connect(
#             user='FATYTBH',
#             password='Fati2003.',
#             account='fwxqibi-cv70898',
#             warehouse='COMPUTE_WH',
#             database='MYCALHABITS',
#             schema='PUBLIC'
#         )
#         print("Connected to Snowflake successfully.")
#         return conn
#     except Exception as e:
#         print(f"Error connecting to Snowflake: {str(e)}")
#         return None

# def execute_query(conn, query):
#     try:
#         cursor = conn.cursor()
#         cursor.execute(query)
#         cursor.close()
#         print("Query executed successfully.")
#     except Exception as e:
#         print(f"Error executing query: {str(e)}")

# # Test the connection and query execution
# if __name__ == "__main__":
#     connection = connect_to_snowflake()

#     if connection:
#         test_query = "SELECT CURRENT_TIMESTAMP()"
#         execute_query(connection, test_query)

#         # Close the connection after testing
#         connection.close()