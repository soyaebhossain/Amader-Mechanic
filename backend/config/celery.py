import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('roadside_assistance')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

from celery.schedules import crontab

app.conf.beat_schedule = {
    'monthly-provider-disbursement-settlement': {
        'task': 'apps.financial_ledger.tasks.run_monthly_disbursement_pipeline',
        # Executes at 02:00 AM on the 1st day of every month (Asia/Dhaka time)
        'schedule': crontab(minute=0, hour=2, day_of_month='1'),
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
