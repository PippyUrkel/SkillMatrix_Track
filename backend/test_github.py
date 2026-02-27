import asyncio
import os
import sys

# Add the backend dir to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.features.skill_analysis.github_scraper import GitHubScraper
from app.features.skill_analysis.analyzer import SkillAnalyzer
from app.features.skill_analysis.schemas import DataSource

async def main():
    username = "torvalds" # test with a known profile, or whatever the user tested with
    print(f"Scraping GitHub for {username}...")
    
    scraper = GitHubScraper()
    try:
        github_data = await scraper.scrape_profile(username)
        print(f"Scrape successful. Found {len(github_data.get('repos', []))} repos.")
    except Exception as e:
        print(f"Scraper error: {e}")
        return

    print("Analyzing data...")
    analyzer = SkillAnalyzer()
    try:
        report = await analyzer.analyze_github(github_data, "Software Engineer")
        print("Analysis complete.")
        print(f"Confidence Score: {report.confidence_score}")
        print(f"Current Level: {report.current_level}")
        print(f"Detected Skills: {len(report.all_skills)}")
        for skill in report.all_skills[:5]:
            print(f"- {skill.name}: {skill.proficiency_score} ({skill.level})")
    except Exception as e:
        print(f"Analyzer error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
