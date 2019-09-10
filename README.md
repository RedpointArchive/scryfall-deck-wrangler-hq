# Scryfall Deck Wrangler

I wanted a way to figure out the potential cards in my loose collection I could put in my unfinished commander deck. So I wrote this tool to do it.

## Usage

```
set SCRYFALL_BEARER_TOKEN=gs-...
set LOOSE_COLLECTION_DECK_ID=cbadd0e0-058c-4311-83fe-be9a4a2bd73e
set TARGET_DECK_ID=5bbee86f-6114-41d5-9900-2ece6074b375
yarn
yarn run start
```

Replace the bearer token with your actual bearer token (you can press F12 while on the Scryfall website to grab your current bearer token from the `Authorization` header of API requests the site makes).

Replace the deck IDs with your own deck IDs (it does not work for decks you are not the owner of).

## Notice

This tool is not affiliated nor endorsed by Scryfall LLC. This tool endeavours to adhere to the Scryfall data guidelines.

This tool is **not supported**. Use at your own risk.