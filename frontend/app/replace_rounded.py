import os
import re

directories = [
    '/home/andre/Desktop/devwork2025/hackathon/SkillMatrix/frontend/app/src/components',
    '/home/andre/Desktop/devwork2025/hackathon/SkillMatrix/frontend/app/src/features',
]

pattern = re.compile(r'rounded-(sm|md|lg|xl|2xl|3xl|full|t-[a-z0-9]+|b-[a-z0-9]+|l-[a-z0-9]+|r-[a-z0-9]+|tl-[a-z0-9]+|tr-[a-z0-9]+|bl-[a-z0-9]+|br-[a-z0-9]+)')

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace with rounded-none
                new_content = pattern.sub('rounded-none', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
