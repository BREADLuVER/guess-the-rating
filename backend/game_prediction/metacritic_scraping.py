from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import logging
from .models import ScrapedGame

# Configure logging
logging.basicConfig(
    filename='game_scraper.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

EXCLUDED_TITLES = [
    "Meta Quest release calendar", "Nintendo Switch release calendar", 
    "PC release calendar", "Xbox One release calendar", 
    "Xbox Series X/S release calendar", "PS4 release calendar", 
    "PS5 release calendar", "[REDACTED]", "read early hands-on impressions", 
    "Mobile", "Switch", "PC", "Xbox One", "Xbox Series X/S", 
    "PS4", "PS5", "See All", "New Switch Games", 
    "New PC Games", "New Xbox Series X/S Games", "New PS5 Games", 
    "Upcoming Releases", "Best Games of All Time", 
    "Best Games This Year", "Games"
]

URL = "https://www.metacritic.com/news/major-new-and-upcoming-video-games-ps5-xbox-switch-pc/"

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--headless")  # Ensure GUI is off
    chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration
    chrome_options.add_argument("--remote-debugging-port=9222")  # Enable remote debugging

    try:
        driver = webdriver.Chrome(options=chrome_options)
        logging.info('Driver setup successful.')
        print('Driver setup successful.')
    except Exception as e:
        logging.error(f'Driver setup failed: {e}')
        print(f'Driver setup failed: {e}')
        return None
    
    return driver

def is_valid_title(title):
    """Check if the title is a valid game title."""
    return title not in EXCLUDED_TITLES

def fetch_game_data():
    print('Fetching game data...')
    try:
        print('Setting up driver...')
        driver = setup_driver()
        if not driver:
            return []

        driver.get(URL)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "tr"))
        )
        print('Page loaded successfully.')
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        game_data = []

        rows = soup.find_all('tr')
        print(f"Number of rows found: {len(rows)}")
        
        for row in rows:
            game_link = row.find('a', href=True, rel="follow")
            if game_link:
                game_name = game_link.text.strip()
                if not is_valid_title(game_name):
                    logging.info(f"Excluded non-game title: {game_name}")
                    continue

                score_tag = row.find('a', class_='c-shortcodeTvObject')
                score = score_tag.text.strip() if score_tag else 'tbd'
                game_data.append((game_name, score))

        logging.info(f"Successfully fetched {len(game_data)} games with scores.")
        driver.quit()
        return game_data

    except Exception as e:
        logging.error(f"Error fetching game data: {e}")
        return []

def save_games_to_db():
    game_data = fetch_game_data()
    if game_data:
        for name, score in game_data:
            try:
                game, created = ScrapedGame.objects.update_or_create(
                    title=name,
                    defaults={'score': score}
                )
                if created:
                    logging.info(f"Added new game: {name} with score {score}")
                else:
                    logging.info(f"Updated game: {name} with new score {score}")
            except Exception as e:
                logging.error(f"Error saving game '{name}' to the database: {e}")
    else:
        logging.warning("No game data fetched to save.")
