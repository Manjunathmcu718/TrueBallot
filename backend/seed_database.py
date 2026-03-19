import os
from pymongo import MongoClient
from faker import Faker
import random
from datetime import datetime, timedelta

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/voter_auth_db")
DB_NAME = "voter_auth_db"
NUM_VOTERS = 500

CONSTITUENCIES = ["NOIDA", "SOUTH DELHI", "MUMBAI SOUTH", "BANGALORE CENTRAL", "HYDERABAD", "CHENNAI CENTRAL"]
POLLING_STATIONS = {
    "NOIDA": ["Noida Sector 15 Community Center", "Amity School Hall", "Noida Stadium Booth"],
    "SOUTH DELHI": ["Saket Community Hall", "Green Park Free Church", "Hauz Khas Polling Station"],
    "MUMBAI SOUTH": ["Colaba Municipal School", "Cuffe Parade Hall", "Malabar Hill Booth"],
    "BANGALORE CENTRAL": ["UB City Polling Center", "St. Joseph's College", "MG Road Metro Station Booth"],
    "HYDERABAD": ["Banjara Hills Community Hall", "Jubilee Hills Public School", "Gachibowli Stadium"],
    "CHENNAI CENTRAL": ["Mylapore Community Center", "Nungambakkam High School", "T. Nagar Polling Booth"]
}

def create_voters():
    print("--- Starting Database Seeding Script ---")
    fake = Faker('en_IN')

    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        voters_collection = db.voters
        print("✅ Successfully connected to MongoDB.")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB. Error: {e}")
        return

    print("Clearing existing collection...")
    voters_collection.delete_many({})
    print("✅ Collection cleared.")

    voters_to_insert = []
    print(f"Generating {NUM_VOTERS} fake voters...")

    # Pick 22 random indices to mark as already voted
    voted_indices = set(random.sample(range(NUM_VOTERS), 22))
    base_time = datetime.utcnow() - timedelta(hours=3)

    for i in range(NUM_VOTERS):
        constituency = random.choice(CONSTITUENCIES)
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=80)

        # Determine if this voter has voted
        has_voted = i in voted_indices
        voting_timestamp = None
        if has_voted:
            voting_timestamp = base_time + timedelta(minutes=random.randint(0, 180))

        voter = {
            "voter_id": f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(1000000, 9999999)}",
            "aadhar_number": fake.unique.numerify(text='############'),
            "phone_number": fake.unique.numerify(text='9#########'),
            "full_name": fake.name().upper(),
            "date_of_birth": datetime.combine(birth_date, datetime.min.time()),
            "address": fake.address().replace('\n', ', '),
            "constituency": constituency,
            "polling_station": random.choice(POLLING_STATIONS[constituency]),
            "has_voted": has_voted,
            "voting_timestamp": voting_timestamp,
            "otp_code": None,
            "otp_expires_at": None,
        }
        voters_to_insert.append(voter)

        if (i + 1) % 50 == 0:
            print(f"   Generated {i + 1}/{NUM_VOTERS} voters...")

    if voters_to_insert:
        print("Inserting all voters into the database...")
        voters_collection.insert_many(voters_to_insert)
        print(f"✅ Successfully inserted {len(voters_to_insert)} voters.")

    # Print summary
    voted_count = sum(1 for v in voters_to_insert if v['has_voted'])
    print(f"\n📊 Summary:")
    print(f"   Total voters: {NUM_VOTERS}")
    print(f"   Votes cast:   {voted_count}")
    print(f"   Turnout:      {(voted_count/NUM_VOTERS*100):.1f}%")

    client.close()
    print("--- Database Seeding Complete ---")

if __name__ == "__main__":
    create_voters()

# import os
# from pymongo import MongoClient
# from faker import Faker
# import random
# from datetime import datetime, timedelta

# # --- Configuration ---
# # Make sure your .env file has your MONGO_URI
# # Example: MONGO_URI=mongodb://localhost:27017/voter_auth_db
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/voter_auth_db")
# DB_NAME = "voter_auth_db"
# NUM_VOTERS = 500  # How many fake voters do you want to create?

# # --- Realistic Sample Data ---
# CONSTITUENCIES = ["NOIDA", "SOUTH DELHI", "MUMBAI SOUTH", "BANGALORE CENTRAL", "HYDERABAD", "CHENNAI CENTRAL"]
# POLLING_STATIONS = {
#     "NOIDA": ["Noida Sector 15 Community Center", "Amity School Hall", "Noida Stadium Booth"],
#     "SOUTH DELHI": ["Saket Community Hall", "Green Park Free Church", "Hauz Khas Polling Station"],
#     "MUMBAI SOUTH": ["Colaba Municipal School", "Cuffe Parade Hall", "Malabar Hill Booth"],
#     "BANGALORE CENTRAL": ["UB City Polling Center", "St. Joseph's College", "MG Road Metro Station Booth"],
#     "HYDERABAD": ["Banjara Hills Community Hall", "Jubilee Hills Public School", "Gachibowli Stadium"],
#     "CHENNAI CENTRAL": ["Mylapore Community Center", "Nungambakkam High School", "T. Nagar Polling Booth"]
# }

# def create_voters():
#     """Generates and inserts fake voter data into the database."""
    
#     print("--- Starting Database Seeding Script ---")
    
#     # Initialize Faker for Indian data
#     fake = Faker('en_IN')
    
#     # Connect to MongoDB
#     try:
#         client = MongoClient(MONGO_URI)
#         db = client[DB_NAME]
#         voters_collection = db.voters
#         print("✅ Successfully connected to MongoDB.")
#     except Exception as e:
#         print(f"❌ Could not connect to MongoDB. Error: {e}")
#         return

#     # Clear existing voters to prevent duplicates
#     print(f"Clearing existing '{voters_collection.name}' collection...")
#     voters_collection.delete_many({})
#     print("✅ Collection cleared.")

#     voters_to_insert = []
#     print(f"Generating {NUM_VOTERS} fake voters...")

#     for i in range(NUM_VOTERS):
#         constituency = random.choice(CONSTITUENCIES)
        
#         # Generate a realistic date of birth for someone between 18 and 80
#         birth_date = fake.date_of_birth(minimum_age=18, maximum_age=80)
        
#         voter = {
#             "voter_id": f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(1000000, 9999999)}",
#             "aadhar_number": fake.unique.numerify(text='############'),
#             "phone_number": fake.unique.numerify(text='9#########'),
#             "full_name": fake.name().upper(),
#             "date_of_birth": datetime.combine(birth_date, datetime.min.time()),
#             "address": fake.address().replace('\n', ', '),
#             "constituency": constituency,
#             "polling_station": random.choice(POLLING_STATIONS[constituency]),
#             "has_voted": False,
#             "voting_timestamp": None,
#             "otp_code": None,
#             "otp_expires_at": None,
#             # We don't need to store age, it can be calculated on the fly
#         }
#         voters_to_insert.append(voter)
        
#         # Print progress
#         if (i + 1) % 50 == 0:
#             print(f"   Generated {i + 1}/{NUM_VOTERS} voters...")

#     # Insert all voters at once (much faster)
#     if voters_to_insert:
#         print("Inserting all generated voters into the database...")
#         voters_collection.insert_many(voters_to_insert)
#         print(f"✅ Successfully inserted {len(voters_to_insert)} voters.")

#     client.close()
#     print("--- Database Seeding Complete ---")

# if __name__ == "__main__":
#     create_voters()