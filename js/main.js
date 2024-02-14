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
                        maxCards: -1,
                        locked: true
                    }
                ]
            };
        },
        methods: {
            addCard(columnIndex) {
                if (this.columns[columnIndex].locked || this.columns[columnIndex].cards.length >= this.columns[columnIndex].maxCards) {
                    return;
                }

                const card = {
                    title: 'New card',
                    items: [
                        { text: 'Item 1', done: false },
                        { text: 'Item 2', done: false },
                        { text: 'Item 3', done: false }
                    ],
                    doneItems: 0,
                    completedAt: null
                };

                this.columns[columnIndex].cards.push(card);
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
                this.saveData();
            },
            checkColumnStatus() {
                const secondColumn = this.columns[1];

                if (secondColumn.cards.length === secondColumn.maxCards) {
                    this.columns[0].locked = true;
                }
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
        }
    });
});