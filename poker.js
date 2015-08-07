var RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
var SUITS = ['c', 'd', 'h', 's'];

var HIGH_CARD = 0;
var ONE_PAIR = 1;
var TWO_PAIR = 2;
var TRIPS = 3;
var STRAIGHT = 4;
var FLUSH = 5;
var FULL_HOUSE = 6;
var QUADS = 7;
var STRAIGHT_FLUSH = 8;
var HAND_RANKINGS = ['High card', 'One pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house',
                     'Four of a kind', 'Straight flush'];

function Deck() {
    this.topCard = 0;
    this.cards = [];

    for (var i in RANKS) {
        for (var j in SUITS) {
            this.cards.push(RANKS[i] + SUITS[j]);
        }
    }
}

Deck.prototype.shuffle = function() {
    for (var i = 0; i < this.cards.length; i++) {
        var j = i + Math.floor(Math.random() * (this.cards.length - i));
        var swap = this.cards[j];
        this.cards[j] = this.cards[i];
        this.cards[i] = swap;
    }
}

Deck.prototype.drawCard = function() {
    if (this.topCard >= this.cards.length) {
        return null;
    }

    return this.cards[this.topCard++];
}

Deck.prototype.findAndDrawCard = function(card) {
    for (var i = this.topCard; i < this.cards.length; i++) {
        if (this.cards[i] === card) {
            this.cards[i] = this.cards[this.topCard];
            this.cards[this.topCard] = card;
        }
    }

    return this.drawCard();
}

Deck.prototype.toString = function() {
    var output = '';

    for (var i = this.topCard; i < this.cards.length; i++) {
        output += this.cards[i];
    }

    return output;
}

Deck.prototype.print = function() {
    console.log(this.toString());
}

function FiveCardHand(level, cards) {
    // Hand level from high card (0) to straight flush (8)
    this.level = level;

    /*
    A string of 5 cards; ex. 'KsKhTd8s5s'

    In general, hands should be ordered with the actual hand and then the kickers, sorted from high to low. For example,
    one pair hands should be as in the example above, and two pair hands should have their higher pair first. Straights
    and flushes should also be sorted from high to low (AKQJT or 5432A).
    */
    this.cards = cards;
}

FiveCardHand.prototype.compare = function(otherHand) {
    if (this.level !== otherHand.level) {
        return this.level < otherHand.level ? -1 : +1;
    }

    for (var i = 0; i < 5; i++) {
        var ourCard = this.cards[2 * i];
        var theirCard = otherHand.cards[2 * i];

        var ourRank = RANKS.indexOf(ourCard);
        var theirRank = RANKS.indexOf(theirCard);

        if (ourRank != theirRank) {
            return ourRank < theirRank ? -1 : +1;
        }
    }

    return 0;
}

FiveCardHand.prototype.toString = function() {
    return HAND_RANKINGS[this.level] + ': ' + this.cards;
}

FiveCardHand.prototype.print = function() {
    console.log(this.toString());
}

FiveCardHand.consecutiveCards = function(cards) {
    var ranks = [];

    for (var i in cards) {
        ranks.push(RANKS.indexOf(cards[i][0]));
    }

    for (var i = 0; i + 1 < ranks.length; i++) {
        var valid = ranks[i] === ranks[i + 1] + 1;

        // Special case for an ace
        if (ranks[i] === 2 && ranks[i + 1] === RANKS.length - 1) {
            valid = true;
        }

        if (!valid) {
            return false;
        }
    }

    return true;
}

FiveCardHand.computeFromCards = function(cardsString) {
    var cards = [];

    for (var i = 0; i < cardsString.length; i += 2) {
        cards.push(cardsString.substring(i, i + 2));
    }

    // Sort in order of rank
    cards.sort(function(a, b) {
        var aRank = RANKS.indexOf(a[0]);
        var bRank = RANKS.indexOf(b[0]);

        if (aRank === bRank) {
            return 0;
        }

        return aRank > bRank ? -1 : +1;
    });

    // Check for a flush
    var suits = {};

    for (var i in SUITS) {
        suits[SUITS[i]] = 0;
    }

    for (var i in cards) {
        suits[cards[i][1]]++;
    }

    var suit = '';

    for (var i in SUITS) {
        if (suits[SUITS[i]] >= 5) {
            suit = SUITS[i];
        }
    }

    if (suit !== '') {
        // The answer is either a flush or a straight flush
        var suitCards = [];

        for (var i in cards) {
            if (cards[i][1] === suit) {
                suitCards.push(cards[i]);
            }
        }

        for (var i = 0; i + 5 <= suitCards.length; i++) {
            var cardsToCheck = suitCards.slice(i, i + 5);

            if (this.consecutiveCards(cardsToCheck)) {
                return new FiveCardHand(STRAIGHT_FLUSH, cardsToCheck.join(''));
            }
        }

        return new FiveCardHand(FLUSH, suitCards.slice(0, 5).join(''));
    }

    // Check for a straight
    for (var i = 0; i + 5 <= cards.length; i++) {
        var cardsToCheck = [];

        for (var j = i; j < cards.length && cardsToCheck.length < 5; j++) {
            if (j === i || cards[j][0] !== cards[j - 1][0]) {
                cardsToCheck.push(cards[j]);
            }
        }

        if (cardsToCheck.length === 5 && this.consecutiveCards(cardsToCheck)) {
            return new FiveCardHand(STRAIGHT, cardsToCheck.join(''));
        }
    }

    // Check for quads
    for (var i = 0; i + 4 <= cards.length; i++) {
        if (cards[i][0] === cards[i + 3][0]) {
            var hand = cards.slice(i, i + 4);

            // Add the kicker
            if (i == 0) {
                hand.push(cards[4]);
            } else {
                hand.push(cards[0]);
            }

            return new FiveCardHand(QUADS, hand.join(''));
        }
    }

    // Check for trips
    for (var i = 0; i + 3 <= cards.length; i++) {
        if (cards[i][0] === cards[i + 2][0]) {
            // We found trips; now check for a full house
            var pair = -1;

            for (var j = 0; j + 1 < cards.length; j++) {
                if (j < i || j >= i + 3) {
                    if (cards[j][0] === cards[j + 1][0]) {
                        pair = j;
                        break;
                    }
                }
            }

            if (pair === -1) {
                var hand = cards.slice(i, i + 3);

                if (i === 0) {
                    hand.push(cards[3]);
                    hand.push(cards[4]);
                } else if (i === 1) {
                    hand.push(cards[0]);
                    hand.push(cards[4]);
                } else {
                    hand.push(cards[0]);
                    hand.push(cards[1]);
                }

                return new FiveCardHand(TRIPS, hand.join(''));
            } else {
                var hand = cards.slice(i, i + 3);
                hand.push(cards[pair]);
                hand.push(cards[pair + 1]);

                return new FiveCardHand(FULL_HOUSE, hand.join(''));
            }
        }
    }

    // Check for a pair
    for (var i = 0; i + 1 < cards.length; i++) {
        if (cards[i][0] === cards[i + 1][0]) {
            // Found a pair; now check for two pair

            for (var j = i + 2; j + 1 < cards.length; j++) {
                if (cards[j][0] === cards[j + 1][0]) {
                    // Found two pair
                    var kicker;

                    if (i > 0) {
                        kicker = cards[0];
                    } else if (i === 0 && j > 2) {
                        kicker = cards[2];
                    } else {
                        kicker = cards[4];
                    }

                    var hand = cards.slice(i, i + 2);
                    hand.push(cards[j]);
                    hand.push(cards[j + 1]);
                    hand.push(kicker);
                    return new FiveCardHand(TWO_PAIR, hand.join(''));
                }
            }

            var hand = cards.slice(i, i + 2);

            // Add kickers
            for (var j = 0; j < 5 && hand.length < 5; j++) {
                if (j < i || j >= i + 2) {
                    hand.push(cards[j]);
                }
            }

            return new FiveCardHand(ONE_PAIR, hand.join(''));
        }
    }

    // High card
    return new FiveCardHand(HIGH_CARD, cards.slice(0, 5).join(''));
}

var deck = new Deck();
console.log('Unshuffled deck:');
deck.print();
deck.shuffle();
console.log('Shuffled deck:');
deck.print();

var hand1 = new FiveCardHand(STRAIGHT, '5c4c3s2dAh');
var hand2 = new FiveCardHand(STRAIGHT, '6c5c4c3c2d');
var hand3 = new FiveCardHand(FLUSH, 'AcJc8c5c2c');
hand1.print();
hand2.print();
hand3.print();
console.log('1 vs. 1: ' + hand1.compare(hand1));
console.log('1 vs. 2: ' + hand1.compare(hand2));
console.log('1 vs. 3: ' + hand1.compare(hand3));
console.log('2 vs. 1: ' + hand2.compare(hand1));
console.log('2 vs. 2: ' + hand2.compare(hand2));
console.log('2 vs. 3: ' + hand2.compare(hand3));
console.log('3 vs. 1: ' + hand3.compare(hand1));
console.log('3 vs. 2: ' + hand3.compare(hand2));
console.log('3 vs. 3: ' + hand3.compare(hand3));

var highCard1 = FiveCardHand.computeFromCards('3h8d6s2c9dKcTc');
var highCard2 = FiveCardHand.computeFromCards('3h8d7s2c9dKcTc');
var highCard3 = FiveCardHand.computeFromCards('3h4d6s2c9dAc7c');
var onePair1 = FiveCardHand.computeFromCards('3hKd6s2c2dAcTc');
var onePair2 = FiveCardHand.computeFromCards('3h8d6s2c3dAcTc');
var onePair3 = FiveCardHand.computeFromCards('3h9d6s2c3dAcTc');
var twoPair1 = FiveCardHand.computeFromCards('3h8d6sTcTdKcKd');
var twoPair2 = FiveCardHand.computeFromCards('3h8d6s2c2dAcAd');
var twoPair3 = FiveCardHand.computeFromCards('3h8d3s2c2dAcAd');
var twoPair4 = FiveCardHand.computeFromCards('3h9d3s2c2dAcAd');
var trips1 = FiveCardHand.computeFromCards('2d6h6d5s9h6c4s');
var trips2 = FiveCardHand.computeFromCards('2d6h6d5s9h6c7s');
var straight1 = FiveCardHand.computeFromCards('2cAc3s4c5s6s9s');
var straight2 = FiveCardHand.computeFromCards('2d6h6d5s3h6c4s');
var straight3 = FiveCardHand.computeFromCards('7d6h6d5s3h6c4s');
var flush1 = FiveCardHand.computeFromCards('KcQc3s5sJc9c8c');
var flush2 = FiveCardHand.computeFromCards('4cAc3s5s6c9c2c');
var flush3 = FiveCardHand.computeFromCards('4cAc3s5s6c9c3c');
var fullHouse1 = FiveCardHand.computeFromCards('2d6h6d5s5h4s6c');
var fullHouse2 = FiveCardHand.computeFromCards('2d6h6d7s7h4s6c');
var fullHouse3 = FiveCardHand.computeFromCards('2d7h7d7s2h4s6c');
var quads1 = FiveCardHand.computeFromCards('3h8d3s3c3d2c2d');
var quads2 = FiveCardHand.computeFromCards('3h8d3s3c3dAcAd');
var quads3 = FiveCardHand.computeFromCards('AhAsAdAcKhKc2d');
var straightFlush1 = FiveCardHand.computeFromCards('6cAc3c4c5c2c9c');
var straightFlush2 = FiveCardHand.computeFromCards('6c7c3c4c5c2c8c');
var straightFlush3 = FiveCardHand.computeFromCards('AcQcTcJcKsKdKc');

highCard1.print();
highCard2.print();
highCard3.print();
onePair1.print();
onePair2.print();
onePair3.print();
twoPair1.print();
twoPair2.print();
twoPair3.print();
twoPair4.print();
trips1.print();
trips2.print();
straight1.print();
straight2.print();
straight3.print();
flush1.print();
flush2.print();
flush3.print();
fullHouse1.print();
fullHouse2.print();
fullHouse3.print();
quads1.print();
quads2.print();
quads3.print();
straightFlush1.print();
straightFlush2.print();
straightFlush3.print();

var hands = [highCard1, highCard2, highCard3, onePair1, onePair2, onePair3, twoPair1, twoPair2, twoPair3, twoPair4,
             trips1, trips2, straight1, straight2, straight3, flush1, flush2, flush3, fullHouse1, fullHouse2,
             fullHouse3, quads1, quads2, quads3, straightFlush1, straightFlush2, straightFlush3];

for (var i = 0; i < hands.length; i++) {
    var output = '';

    for (var j = 0; j < hands.length; j++) {
        var result = hands[i].compare(hands[j]);

        if (result === -1) {
            output += 'L';
        } else if (result === 0) {
            output += 'T';
        } else {
            output += 'W';
        }
    }

    output += ' ' + hands[i].toString();
    console.log(output);
}

var hand1 = deck.findAndDrawCard('4c') + deck.findAndDrawCard('4s');
var hand2 = deck.findAndDrawCard('5h') + deck.findAndDrawCard('7h');
var flop = deck.findAndDrawCard('4h') + deck.findAndDrawCard('6h') + deck.findAndDrawCard('As');

var cards = [];
var draw = deck.drawCard();

while (draw !== null) {
    cards.push(draw);
    draw = deck.drawCard();
}

var wins1 = 0;
var wins2 = 0;
var ties = 0;

for (var i = 0; i < cards.length; i++) {
    for (var j = i + 1; j < cards.length; j++) {
        var fullHand1 = FiveCardHand.computeFromCards(hand1 + flop + cards[i] + cards[j]);
        var fullHand2 = FiveCardHand.computeFromCards(hand2 + flop + cards[i] + cards[j]);
        var result = fullHand1.compare(fullHand2);

        if (result === -1) {
            wins2++;
        } else if (result === 0) {
            ties++;
        } else {
            wins1++;
        }
    }
}

var equity1 = 100 * (wins1 + 0.5 * ties) / (wins1 + wins2 + ties);
var equity2 = 100 * (wins2 + 0.5 * ties) / (wins1 + wins2 + ties);
console.log(hand1 + ' vs. ' + hand2 + ' on ' + flop + ': ' + Number(equity1).toFixed(2) + '% vs. ' + Number(equity2).toFixed(2) + '%');
console.log(wins1 + ' wins ' + ties + ' ties ' + wins2 + ' wins');
