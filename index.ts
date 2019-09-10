import axios, { AxiosInstance } from "axios";

const looseCollectionDeckID = process.env.LOOSE_COLLECTION_DECK_ID;
const targetDeckID = process.env.TARGET_DECK_ID;

const attachFullCardInformation = async (a: AxiosInstance, deck: any) => {
    const cardIDs = [];
    for (const k of Object.keys(deck.entries)) {
        const deckEntries = deck.entries[k];
        for (const deckEntry of deckEntries) {
            if (deckEntry.found) {
                cardIDs.push({ id: deckEntry.card_digest.id });
            }
        }
    }

    const cardData = new Map<string, any>();
    for (let i = 0; i < cardIDs.length; i += 75) {
        const response = (await a.post(`https://api.scryfall.com/cards/collection`, { identifiers: cardIDs.slice(i, i + 75) })).data;
        for (const card of response.data) {
            cardData.set(card.id, card);
        }
    }

    for (const k of Object.keys(deck.entries)) {
        const deckEntries = deck.entries[k];
        for (const deckEntry of deckEntries) {
            if (deckEntry.found) {
                if (cardData.has(deckEntry.card_digest.id)) {
                    deckEntry.card_full = cardData.get(deckEntry.card_digest.id);
                }
            }
        }
    }
}

function* allDeckEntries(deck: any) {
    for (const k of Object.keys(deck.entries)) {
        const deckEntries = deck.entries[k];
        for (const deckEntry of deckEntries) {
            yield deckEntry;
        }
    }
}

const run = async () => {
    const a = axios.create({
        headers: {
            'Authorization': `Bearer ${process.env.SCRYFALL_BEARER_TOKEN}`
        }
    })

    const looseCollectionDeck = (await a.get(`https://api.scryfall.com/decks/${looseCollectionDeckID}`)).data;
    const targetDeck = (await a.get(`https://api.scryfall.com/decks/${targetDeckID}`)).data;
    
    await attachFullCardInformation(a, looseCollectionDeck);
    await attachFullCardInformation(a, targetDeck);

    // Get allowed colors from primary commander's color identity.
    const primaryCommander = targetDeck.entries.commanders[0];
    const allowedColors = new Set<string>(primaryCommander.card_full.color_identity);

    // Make a map of all cards currently in the target deck (so we know what cards we can't pick).
    const existingCards = new Set<string>();
    for (const deckEntry of allDeckEntries(targetDeck)) {
        if (deckEntry.found) {
            existingCards.add(deckEntry.card_digest.id);
        }
    }

    // Iterate through the cards in the loose collection deck, and find cards that are allowed
    // based on color identity, and don't already exist in the target deck.
    const cardsToEmit = new Map<string, any>();
    for (const deckEntry of allDeckEntries(looseCollectionDeck)) {
        if (!deckEntry.found) {
            continue;
        }

        if (existingCards.has(deckEntry.card_digest.id)) {
            // Already exists in target deck.
            continue;
        }

        // See if it's allowed based on color identity.
        let allowed = true;
        if (deckEntry.card_full === undefined) {
            console.log(deckEntry);
        }
        for (const color of deckEntry.card_full.color_identity) {
            if (!allowedColors.has(color)) {
                allowed = false;
                break;
            }
        }
        if (!allowed) {
            continue;
        }

        cardsToEmit.set(deckEntry.card_full.id, deckEntry.card_full);
    }

    // Print out the results.
    console.log();
    console.log(`Found ${cardsToEmit.size} potential cards for inclusion:`);
    console.log();

    for (const card of cardsToEmit.values()) {
        console.log(`${card.name}`);
    }

    console.log();
}

run().catch(console.error);