document.addEventListener('DOMContentLoaded', () => {
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
                ]
            }
        },
        methods: {
            checkColumnStatus() {
                const secondColumn = this.columns[1];

                if (secondColumn.cards.length === secondColumn.maxCards) {
                    this.columns[0].locked = true;
                }
            },
            clearAllCards() {
                for (const column of this.columns) {
                    column.cards = [];
                }

                // Reset locked state of first and second columns after all cards have been cleared
                for (const col of this.columns) {
                    if (col.title === 'First' || col.title === 'Second') {
                        col.locked = false;
                    }
                }

                // Save data to local storage
                this.saveData();
            },
            addCard(column) {
                if (column.locked || (column.cards && column.cards.length >= column.maxCards)) {
                    return;
                }

                const newCard = {
                    id: Date.now(),
                    title: 'New card',
                    items: [
                        { text: 'Item 1', completed: false },
                        { text: 'Item 2', completed: false },
                        { text: 'Item 3', completed: false }
                    ],
                    doneItems: 0,
                    completedAt: null
                };

                if (column.cards) {
                    column.cards.push(newCard);
                } else {
                    column.cards = [newCard];
                }

                this.saveData();
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
                    this.moveCard(card, 1);
                } else if (secondColumn.cards.includes(card) && card.doneItems === card.items.length) {
                    this.moveCard(card, 2);
                }
            },
            moveCard(card, targetColumnIndex) {
                const sourceColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
                this.columns[sourceColumnIndex].cards.splice(this.columns[sourceColumnIndex].cards.indexOf(card), 1);
                this.columns[targetColumnIndex].cards.push(card);

                // Save data to local storage
                this.saveData();

                if (targetColumnIndex === 1 && this.columns[1].cards.length > this.columns[1].maxCards) {
                    this.columns[1].locked = true;
                }

                if (targetColumnIndex === 1) {
                    this.checkCardCompletion();
                }

                if (targetColumnIndex === 2) {
                    card.completedAt = new Date().toLocaleString();
                }

                this.checkColumnStatus();
            },
            unlockFirstColumn() {
                const firstColumn = this.columns[0];
                firstColumn.locked = false;

                // Save data to local storage
                this.saveData();
            },
            checkCardCompletion() {
                const firstColumn = this.columns[0];

                if (firstColumn.cards.some(card => card.doneItems === card.items.length)) {
                    this.unlockFirstColumn();
                }
            },
            saveData() {
                localStorage.setItem('columns', JSON.stringify(this.columns));
            }

        },
        created() {
            const savedColumns = JSON.parse(localStorage.getItem('columns'));
            if (savedColumns) {
                this.columns = savedColumns;
                this.checkColumnStatus();
                this.checkCardCompletion();
            }
        },
    updated() {
        this.saveData();
    }
});

function task(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Task "${title}" is completed.`);
            resolve();
        }, Math.random() * 1000);
    });
}
});