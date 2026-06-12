import os
import random
import numpy as np
import joblib
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.models import Student

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with admin, teacher, and 1000 realistic student records, and runs the ML model to predict their grades.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        Student.objects.all().delete()
        # Keep superusers and other users, but reset default seed users if they exist
        User.objects.filter(username__in=['admin', 'teacher']).delete()
        
        self.stdout.write('Creating users...')
        # Create Admin
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@school.edu',
            password='Password123',
            role=User.ADMIN
        )
        self.stdout.write(f'Created Admin User: admin / Password123')
        
        # Create Teacher
        teacher_user = User.objects.create_user(
            username='teacher',
            email='teacher@school.edu',
            password='Password123',
            role=User.TEACHER
        )
        self.stdout.write(f'Created Teacher User: teacher / Password123')
        
        # Load ML model and scaler
        ml_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml')
        model_path = os.path.join(ml_dir, 'classifier.joblib')
        scaler_path = os.path.join(ml_dir, 'scaler.joblib')
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            self.stdout.write('ML model or scaler not found. Running training script first...')
            from analytics.ml.train import train_model
            train_model()
            
        scaler = joblib.load(scaler_path)
        model = joblib.load(model_path)
        
        self.stdout.write('Generating 1000 realistic student records...')
        
        first_names = [
            'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia', 'Elijah', 'Isabella', 'James', 
            'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Alexander', 'Harper', 'Mason', 'Evelyn', 'Ethan', 
            'Abigail', 'Daniel', 'Emily', 'Henry', 'Aria', 'Sebastian', 'Elizabeth', 'Aiden', 'Sofia', 'Matthew',
            'Jackson', 'Logan', 'Avery', 'Madison', 'Ella', 'Jackson', 'Chloe', 'Grace', 'Victoria', 'Dylan'
        ]
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
        ]
        departments = [
            'Computer Science & Engineering',
            'Electrical & Electronics Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Data Science & AI'
        ]
        
        # We will generate correlated attributes based on a latent capability variable
        students_to_create = []
        random.seed(42)
        np.random.seed(42)
        
        capabilities = np.random.beta(a=3, b=3, size=1000)
        
        used_emails = set()
        
        for i in range(1000):
            capability = capabilities[i]
            
            # Generate correlated values with noise
            att = 50.0 + capability * 48.0 + np.random.normal(0, 3)
            att = float(np.clip(att, 40.0, 100.0))
            
            study = 2.0 + capability * 28.0 + np.random.normal(0, 2)
            study = float(np.clip(study, 1.0, 35.0))
            
            internal = 30.0 + capability * 65.0 + np.random.normal(0, 5)
            internal = float(np.clip(internal, 0.0, 100.0))
            
            assignment = 35.0 + capability * 60.0 + np.random.normal(0, 5)
            assignment = float(np.clip(assignment, 0.0, 100.0))
            
            quiz = 25.0 + capability * 70.0 + np.random.normal(0, 6)
            quiz = float(np.clip(quiz, 0.0, 100.0))
            
            gpa = 3.0 + capability * 6.5 + np.random.normal(0, 0.4)
            gpa = float(np.clip(gpa, 2.0, 10.0))
            
            # Formulate identity
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            name = f"{first_name} {last_name}"
            
            email = f"{first_name.lower()}.{last_name.lower()}{i}@school.edu"
            
            student_id = f"STU{20260000 + i:05d}"
            dept = random.choice(departments)
            sem = random.randint(1, 8)
            
            # Predict using ML model
            features = np.array([[att, internal, assignment, quiz, study, gpa]])
            features_scaled = scaler.transform(features)
            pred_grade = model.predict(features_scaled)[0]
            
            student = Student(
                student_id=student_id,
                name=name,
                email=email,
                department=dept,
                semester=sem,
                attendance_percentage=att,
                internal_marks=internal,
                assignment_marks=assignment,
                quiz_marks=quiz,
                study_hours=study,
                gpa=gpa,
                predicted_grade=pred_grade
            )
            # Notice: risk_level is automatically calculated and set in student.save()
            student.risk_level = student.calculate_risk()
            students_to_create.append(student)
            
        # Bulk create all students
        Student.objects.bulk_create(students_to_create)
        self.stdout.write(self.style.SUCCESS('Successfully seeded 1000 student records!'))
