import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ADMIN = 'ADMIN'
    TEACHER = 'TEACHER'
    STUDENT = 'STUDENT'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (TEACHER, 'Teacher'),
        (STUDENT, 'Student'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=TEACHER)
    email = models.EmailField(unique=True, blank=True, default='')
    # Links a STUDENT-role user back to the Student record
    student_ref_id = models.CharField(max_length=50, blank=True, null=True, unique=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Student(models.Model):
    LOW = 'Low'
    MEDIUM = 'Medium'
    HIGH = 'High'
    
    RISK_CHOICES = [
        (LOW, 'Low Risk'),
        (MEDIUM, 'Medium Risk'),
        (HIGH, 'High Risk'),
    ]
    
    EXCELLENT = 'Excellent'
    GOOD = 'Good'
    AVERAGE = 'Average'
    POOR = 'Poor'
    
    GRADE_CHOICES = [
        (EXCELLENT, 'Excellent'),
        (GOOD, 'Good'),
        (AVERAGE, 'Average'),
        (POOR, 'Poor'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    semester = models.IntegerField()
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    internal_marks = models.DecimalField(max_digits=5, decimal_places=2)
    assignment_marks = models.DecimalField(max_digits=5, decimal_places=2)
    quiz_marks = models.DecimalField(max_digits=5, decimal_places=2)
    study_hours = models.DecimalField(max_digits=4, decimal_places=2)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    
    # ML & Rule-Based analytics output fields
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default=LOW)
    predicted_grade = models.CharField(max_length=15, choices=GRADE_CHOICES, default=AVERAGE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_risk(self):
        """
        Calculate risk based on rules:
        High Risk: Attendance < 70% OR GPA < 6
        Medium Risk: Attendance 70%-85% OR GPA 6-8 (and not high risk)
        Low Risk: Attendance > 85% AND GPA > 8
        """
        att = float(self.attendance_percentage)
        gpa_val = float(self.gpa)
        
        if att < 70.0 or gpa_val < 6.0:
            return self.HIGH
        elif (70.0 <= att <= 85.0) or (6.0 <= gpa_val <= 8.0):
            return self.MEDIUM
        else:
            return self.LOW

    def save(self, *args, **kwargs):
        self.risk_level = self.calculate_risk()
        super().save(*args, **kwargs)
        # Auto-create a login account for this student
        user, created = User.objects.get_or_create(
            username=self.student_id,
            defaults={
                'email': self.email,
                'role': User.STUDENT,
                'student_ref_id': self.student_id,
                'first_name': self.name.split()[0] if self.name else '',
                'last_name': ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else '',
            }
        )
        if created:
            user.set_password(self.student_id)  # Default password = student_id
            user.save()
        elif not user.student_ref_id:
            # Backfill student_ref_id if missing (existing accounts)
            user.student_ref_id = self.student_id
            user.email = self.email
            user.save()

    def __str__(self):
        return f"{self.name} ({self.student_id})"
