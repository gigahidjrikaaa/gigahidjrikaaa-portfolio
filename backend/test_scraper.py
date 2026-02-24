import asyncio
from app.services.scraper_service import scrape_url, _fallback_extraction

async def main():
    url = "https://www.kompas.id/artikel/membangun-jembatan-kesehatan-mental-lewat-ai"
    scraped = await scrape_url(url)
    print("--- SCRAPED ---")
    for k, v in scraped.items():
        if k == "content_snippet":
            print(f"{k}: {len(v)} chars")
        else:
            print(f"{k}: {v}")
            
    print("\n--- FALLBACK ---")
    fallback = _fallback_extraction(scraped, "press_mention")
    for k, v in fallback.items():
        print(f"{k}: {v}")

if __name__ == "__main__":
    asyncio.run(main())
