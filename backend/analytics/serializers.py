from rest_framework import serializers
from django.contrib.auth import get_user_model
from analytics.models import Student

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')
        read_only_fields = ('id',)


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = (
            'id', 'student_id', 'name', 'email', 'department', 'semester',
            'attendance_percentage', 'internal_marks', 'assignment_marks',
            'quiz_marks', 'study_hours', 'gpa', 'risk_level', 'predicted_grade',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'risk_level', 'predicted_grade', 'created_at', 'updated_at')

    def validate_attendance_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Attendance percentage must be between 0 and 100.")
        return value

    def validate_internal_marks(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Internal marks must be between 0 and 100.")
        return value

    def validate_assignment_marks(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Assignment marks must be between 0 and 100.")
        return value

    def validate_quiz_marks(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Quiz marks must be between 0 and 100.")
        return value

    def validate_study_hours(self, value):
        if value < 0 or value > 168: # hours in a week
            raise serializers.ValidationError("Study hours must be between 0 and 168.")
        return value

    def validate_gpa(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("GPA/CGPA must be between 0.0 and 10.0.")
        return value
