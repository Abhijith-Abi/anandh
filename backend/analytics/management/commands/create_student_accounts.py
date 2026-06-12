from django.core.management.base import BaseCommand
from analytics.models import Student, User


class Command(BaseCommand):
    help = 'Create student user accounts for all existing Student records (default password = student_id)'

    def handle(self, *args, **options):
        students = Student.objects.all()
        created_count = 0
        skipped_count = 0

        for student in students:
            user, created = User.objects.get_or_create(
                username=student.student_id,
                defaults={
                    'email': student.email,
                    'role': User.STUDENT,
                    'student_ref_id': student.student_id,
                    'first_name': student.name.split()[0] if student.name else '',
                    'last_name': ' '.join(student.name.split()[1:]) if len(student.name.split()) > 1 else '',
                }
            )
            if created:
                user.set_password(student.student_id)
                user.save()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created account for: {student.name} ({student.student_id})'))
            else:
                if not user.student_ref_id:
                    user.student_ref_id = student.student_id
                    user.save()
                skipped_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created: {created_count}, Already existed: {skipped_count}'
        ))
