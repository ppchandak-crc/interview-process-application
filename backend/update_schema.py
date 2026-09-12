from app.config.database import SessionLocal
from app.models.activity import Activity
from datetime import date
import json

def update():
    db = SessionLocal()
    try:
        activity = db.query(Activity).filter_by(id=1).first()
        if not activity:
            print("Activity not found.")
            return

        form_schema = {
            "sections": [
                {
                    "id": "sec_whatsapp",
                    "title": "WhatsApp Contact",
                    "fields": [
                        {"id": "whatsapp_number", "type": "text", "label": "WhatsApp Mobile Number", "required": True, "width": "half"},
                        {"id": "whatsapp_confirm", "type": "text", "label": "Confirm WhatsApp Mobile Number", "required": True, "width": "half"},
                        {"id": "whatsapp_proof", "type": "file", "label": "Upload WhatsApp Number Proof", "required": True, "width": "full", "helperText": "Open WhatsApp Settings/Profile and upload a screenshot showing your registered mobile number."}
                    ]
                },
                {
                    "id": "sec_personal",
                    "title": "Personal Information",
                    "fields": [
                        {"id": "surname", "type": "text", "label": "Surname", "required": True, "width": "third"},
                        {"id": "first_name", "type": "text", "label": "First Name", "required": True, "width": "third"},
                        {"id": "middle_name", "type": "text", "label": "Middle Name", "required": False, "width": "third"},
                        {"id": "address", "type": "textarea", "label": "Complete Address / Locality", "required": True, "width": "full"},
                        {"id": "city", "type": "text", "label": "City / Town", "required": True, "width": "third"},
                        {"id": "district", "type": "text", "label": "District", "required": True, "width": "third"},
                        {"id": "pincode", "type": "text", "label": "PIN Code", "required": True, "width": "third"},
                        {"id": "photo", "type": "file", "label": "Participant Photo", "required": True, "width": "half"},
                        {"id": "id_type", "type": "select", "label": "ID Proof Type", "required": True, "width": "half", "options": ["Aadhaar", "PAN Card", "Voter ID", "Driving License"]},
                        {"id": "id_proof", "type": "file", "label": "Upload ID Proof / Aadhaar", "required": True, "width": "full"},
                        {"id": "dob", "type": "date", "label": "Date of Birth", "required": True, "width": "half"},
                        {"id": "age", "type": "text", "label": "Age", "required": False, "width": "half"}
                    ]
                },
                {
                    "id": "sec_college",
                    "title": "College Information",
                    "fields": [
                        {"id": "college_name", "type": "select", "label": "Name of College", "required": True, "width": "full", "options": ["KTHM College", "BYK College", "Other"]},
                        {"id": "roll_no", "type": "text", "label": "College Registration / Roll Number", "required": True, "width": "third"},
                        {"id": "stream", "type": "select", "label": "Stream", "required": True, "width": "third", "options": ["B.Com", "M.Com", "BBA", "Other"]},
                        {"id": "year", "type": "select", "label": "Current Year of Education", "required": True, "width": "third", "options": ["FY", "SY", "TY", "Post Grad"]}
                    ]
                },
                {
                    "id": "sec_experience",
                    "title": "Experience",
                    "fields": [
                        {"id": "exp_crc", "type": "select", "label": "Have you previously participated with Chandak Rahane & Co. in Stock Audit / Physical Inventory Verification?", "required": True, "width": "full", "options": ["Yes", "No"]},
                        {"id": "exp_other", "type": "select", "label": "Do you have any other industrial / Stock Audit / PIV / audit-related practical experience?", "required": True, "width": "full", "options": ["Yes", "No"]}
                    ]
                },
                {
                    "id": "sec_parent",
                    "title": "Parent Permission",
                    "fields": [
                        {"id": "parent_perm", "type": "select", "label": "Have you obtained permission from your parent / guardian?", "required": True, "width": "half", "options": ["Yes", "No"]},
                        {"id": "parent_mobile", "type": "text", "label": "Parent Mobile Number", "required": True, "width": "half"}
                    ]
                },
                {
                    "id": "sec_friend",
                    "title": "Friend Information",
                    "fields": [
                        {"id": "friend_name", "type": "text", "label": "Name of Friend with whom you are coming", "required": False, "width": "half"},
                        {"id": "friend_mobile", "type": "text", "label": "Friend Mobile Number", "required": False, "width": "half"}
                    ]
                },
                {
                    "id": "sec_safety",
                    "title": "Safety & Availability",
                    "fields": [
                        {"id": "safety_shoes", "type": "select", "label": "Are you ready to purchase safety shoes costing approximately ₹200 to ₹400 for your own safety, if required?", "required": True, "width": "full", "options": ["Yes", "No", "Already Have"]},
                        {"id": "availability", "type": "select", "label": "Are you available for the complete activity period mentioned above?", "required": True, "width": "full", "options": ["Yes", "No"]}
                    ]
                },
                {
                    "id": "sec_declaration",
                    "title": "Declaration & Consent",
                    "fields": [
                        {"id": "consent", "type": "checkbox", "label": "I confirm that the information provided by me is correct. I consent to Chandak Rahane & Co. collecting and using the information, photograph and identity proof submitted by me for participant verification, communication, interview, selection and administration of the concerned industrial activity. I understand that registration does not guarantee selection and agree to follow applicable safety, discipline and operational instructions.", "required": True, "width": "full"}
                    ]
                }
            ]
        }

        activity.name = "PIV Test Activity"
        activity.client = "Test Client"
        activity.location = "Nashik"
        activity.start_date = date(2026, 1, 10)
        activity.end_date = date(2026, 10, 10)
        activity.registration_closing_date = date(2026, 1, 5)
        activity.introductory_paragraph = "Welcome to the Physical Inventory Verification registration process.\n\nPlease fill all information carefully and correctly."
        activity.form_schema = form_schema

        db.commit()
        print("Successfully updated activity 1 with new schema.")
    finally:
        db.close()

if __name__ == "__main__":
    update()
