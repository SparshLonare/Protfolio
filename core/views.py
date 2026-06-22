from django.shortcuts import render

def home(request):
    projects = [
        {
            'number': '01',
            'title': 'Youtube-Video-Downloader',
            'description': 'Simple web app made using python flask to download youtube videos.',
            'tags': ['Python','HTMl','CSS','Flask'],
            'github_url': 'https://github.com/SparshLonare/Youtube-Video-Downloader', # Placeholder / profile link
        },
        {
            'number': '02',
            'title': 'Student-Feedback-System',
            'description': "Simple feedback form made using python to take feedback from students.",
            'tags': ['Python', 'Numpy', 'HTML', 'CSS'],
            'github_url': 'https://github.com/SparshLonare',
        },
        {
            'number': '03',
            'title': 'ML Exploration Projects',
            'description': 'Hands-on experiments with classification models, data preprocessing pipelines, and visualisation.',
            'tags': ['Python', 'scikit-learn', 'Pandas', 'Matplotlib'],
            'github_url': 'https://github.com/SparshLonare',
        },
    ]
    return render(request, 'home.html', {'projects': projects})
