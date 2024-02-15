const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {
                    title: 'First',
                    cards: [],
                    maxCards: 3,
                    locked: false
                },
                {
                    title: 'Second',
                    cards: [],
                    maxCards: 5,
                    locked: false
                },
                {
                    title: 'Third',
                    cards: [],
                    maxCards: 10000,
                    locked: true
                }
            ],
            minNumberOfItems: 3,
            maxNumberOfItems: 5,
            editedCard: null,
            isEditing: false
        };
    },
    methods: {
        checkColumnStatus() {
            const secondColumn = this.columns[1];

            if (secondColumn.cards.length === secondColumn.maxCards) {
                this.columns[0].locked = true;
            }
        },
        checkCardCompletion(card) {
            if (card.doneItems === card.items.length) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                this.moveCard(card, targetColumnIndex);
                card.completedAt = new Date().toLocaleString();
            } else if (card.doneItems >= card.items.length / 2) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Second');
                this.moveCard(card, targetColumnIndex);
            }
        },
        clearAllCards() {
            for (const column of this.columns) {
                column.cards = [];
            }
        },
        addCard(column) {
            if (column.locked || column.cards.length >= column.maxCards) {
                console.log("Card creation prevented.");
                return;
            }

            if (column.title === 'First' || column.title === 'Second') {
                for (const col of this.columns) {
                    if (col.title === 'First' || col.title === 'Second') {
                        col.locked = false;
                    }
                }
            }

            const newCard = {
                id: Date.now(),
                title: 'New card',
                items: [
                    { text: 'Item 1', completed: false, editable: false },
                    { text: 'Item 2', completed: false, editable: false },
                    { text: 'Item 3', completed: false, editable: false }
                ],
                completedItems: 0,
                completedAt: null
            };

            column.cards.push(newCard);
            this.editedCard = newCard;
            this.isEditing = true;
        },
        updateCardTitle(card) {
            if (card.title !== this.editedCard.title && this.editedCard) {
                card.title = this.editedCard.title;
                this.editedCard = null;
                this.isEditing = false;
            }
        },
        updateItem(card, itemIndex) {
            card.items[itemIndex].done = !card.items[itemIndex].done;
            card.doneItems = card.items.filter(item => item.done).length;

            const firstColumn = this.columns[0];
            const secondColumn = this.columns[1];

            if (firstColumn.locked && card.doneItems >= card.items.length / 2) {
                this.unlockFirstColumn();
            }

            if (firstColumn.cards.includes(card) && card.doneItems >= card.items.length / 2) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Second');
                this.moveCard(card, targetColumnIndex);
            } else if (secondColumn.cards.includes(card) && card.doneItems === card.items.length) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                this.moveCard(card, targetColumnIndex);
                card.completedAt = new Date().toLocaleString();
            }

            this.checkCardCompletion(card);
            this.checkColumnStatus();
        },
        moveCard(card, targetColumnIndex) {
            const sourceColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
            this.columns[sourceColumnIndex].cards.splice(this.columns[sourceColumnIndex].cards.indexOf(card), 1);
            this.columns[targetColumnIndex].cards.push(card);

            this.checkColumnStatus();
        },
        unlockFirstColumn() {
            const firstColumn = this.columns[0];
            firstColumn.locked = false;
        },
        editCard(card) {
            this.editedCard = { ...card };
            this.isEditing = true;
        },
        addCardItem(card) {
            if (card.items.length >= this.maxNumberOfItems) {
                console.log('Maximum number of items (${this.maxNumberOfItems}) reached.');
                return;
            }
            card.items.push({ text: 'New item', done: false, editable: true });
            this.updateItem(card, card.items.length - 1);
        },
        removeCardItem(card, itemIndex) {
            if (card.items.length <= this.minNumberOfItems) {
                console.log('Minimum number of items (${this.minNumberOfItems}) must be maintained.');
                return;
            }
            card.items.splice(itemIndex, 1);
        },
        editCardItem(card, itemIndex) {
            card.items[itemIndex].editable = !card.items[itemIndex].editable;
            },
        unlockFirstColumn(column) {
            if (column.title === 'First' && column.locked) {
                column.locked = false;
            }
        }
    },
    created() {
        const savedColumns = JSON.parse(localStorage.getItem('columns'));
        if (savedColumns) {
            this.columns = savedColumns;
            this.checkColumnStatus();
        }
    },
    updated() {
        localStorage.setItem('columns', JSON.stringify(this.columns));
    }
});