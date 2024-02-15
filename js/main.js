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
                    locked: true
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
            isEditing: false,
            firstColumnLocked: false,
        };
    },
    methods: {
        checkColumnStatus() {
            const secondColumn = this.columns[1];

            if (secondColumn.cards.length === secondColumn.maxCards) {
                secondColumn.locked = true;

                for (const card of secondColumn.cards) {
                    if (card.completedItems === card.items.length) {
                        const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                        this.moveCard(card, targetColumnIndex);
                        card.completedAt = new Date().toLocaleString();
                    }
                }

                this.lockFirstColumn();
            } else {
                secondColumn.locked = false;

                if (this.columns[0].cards.some(card => card.completedItems >= card.items.length / 2)) {
                    this.unlockFirstColumn();
                }
            }

            this.checkSecondColumnStatus();
        },
        checkSecondColumnStatus() {
            const secondColumn = this.columns[1];

            if (secondColumn.cards.length === secondColumn.maxCards) {
                for (const card of secondColumn.cards) {
                    if (card.doneItems === card.items.length && this.canMoveCard(card, 2)) {
                        const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                        this.moveCard(card, targetColumnIndex);
                        card.completedAt = new Date().toLocaleString();
                    }
                }
            }
        },
        lockFirstColumn() {
            this.columns[0].locked = true;
            this.columns[0].cards.forEach(card => {
                card.locked = true;
            });
        },
        unlockFirstColumn() {
            this.columns[0].locked = false;
            this.columns[0].cards.forEach(card => {
                card.locked = false;
            });
        },
        checkCardCompletion(card) {
            if (card.completedItems === card.items.length) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                this.moveCard(card, targetColumnIndex);
                card.completedAt = new Date().toLocaleString();
            } else if (card.completedItems >= card.items.length / 2) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Second');
                if (this.columns[1].cards.length < this.columns[1].maxCards && !this.firstColumnLocked) {
                    this.moveCard(card, targetColumnIndex);
                }
            }

            this.checkColumnStatus();

            if (this.columns[1].cards.length === this.columns[1].maxCards && this.columns[0].cards.some(c => c.completedItems >= c.items.length / 2)) {
                this.firstColumnLocked = true;
            }
        },
        clearAllCards() {
            for (const column of this.columns) {
                column.cards = [];
            }
        },
        addCard(column) {
            if (column.locked || column.cards.length >= column.maxCards || (column.title === 'Second' || column.locked)) {
                console.log("Card creation prevented.");
                return;
            }
            if (column.locked || column.cards.length >= column.maxCards) {
                console.log("Card creation prevented.");
                return;
            }

            if (column.title === 'First' || column.title === 'Second') {
                this.columns.forEach(col => {
                    if (col.title === 'First' || col.title === 'Second') {
                        col.locked = false;
                    }
                });

                if (this.columns[1].cards.length === this.columns[1].maxCards && this.columns[0].cards.some(card => card.doneItems >= card.items.length / 2)) {
                    this.columns[0].locked = true;
                }
            }

            const newCard = {
                id: Date.now(),
                title: 'New card',
                items: [
                    { text: 'Item 1', completed: false, doneItems: 0, editable: false },
                    { text: 'Item 2', completed: false, doneItems: 0, editable: false },
                    { text: 'Item 3', completed: false, doneItems: 0, editable: false }
                ],
                completedItems: 0,
                completedAt: null
            };

            column.cards.push(newCard);
            this.editedCard = newCard;
            this.isEditing = true;

            this.checkColumnStatus();
        },
        updateCardTitle(card) {
            if (card.title !== this.editedCard.title && this.editedCard) {
                card.title = this.editedCard.title;
                this.editedCard = null;
                this.isEditing = false;
            }
        },
        lockFirstColumnItems() {
            if (this.firstColumnLocked) return;

            const firstColumn = this.columns[0];
            firstColumn.cards.forEach(card => {
                card.items.forEach(item => {
                    item.editable = false;
                });
            });
            this.firstColumnLocked = true;
        },

        unlockFirstColumnItems() {
            if (!this.firstColumnLocked) return;

            const firstColumn = this.columns[0];
            firstColumn.cards.forEach(card => {
                card.items.forEach(item => {
                    item.editable = true;
                });
            });
            this.firstColumnLocked = false;
        },
        updateItem(card, itemIndex) {
            card.items[itemIndex].done = !card.items[itemIndex].done;
            const completedItems = card.items.filter(item => item.done);
            this.$set(card, 'completedItems', completedItems.length);

            if (this.firstColumnLocked && card.completedItems >= card.items.length / 2) {
                return;
            }

            const firstColumn = this.columns[0];
            const secondColumn = this.columns[1];

            if (firstColumn.locked && card.completedItems >= card.items.length / 2) {
                this.unlockFirstColumn();
            }

            if (firstColumn.cards.includes(card) && card.completedItems >= card.items.length / 2) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Second');
                if (this.columns[1].cards.length < this.columns[1].maxCards && !this.firstColumnLocked) {
                    this.moveCard(card, targetColumnIndex);
                }
            } else if (secondColumn.cards.includes(card) && card.completedItems === card.items.length) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                this.moveCard(card, targetColumnIndex);
                card.completedAt = new Date().toLocaleString();
            }

            this.checkCardCompletion(card);
        },
        moveCard(card, targetColumnIndex) {
            const sourceColumnIndex = this.columns.findIndex(column => column.cards.includes(card));

            if (sourceColumnIndex === 0 && targetColumnIndex === 1) {
                const firstColumn = this.columns[0];
                const secondColumn = this.columns[1];

                if (secondColumn.cards.length === secondColumn.maxCards) {
                    let halfOfItemsReached = false;
                    for (const colCard of firstColumn.cards) {
                        const halfOfItems = Math.ceil(colCard.items.length / 2);
                        if (colCard.completedItems >= halfOfItems) {
                            halfOfItemsReached = true;
                        }
                    }

                }
            }

            this.columns[sourceColumnIndex].cards.splice(this.columns[sourceColumnIndex].cards.indexOf(card), 1);
            this.columns[targetColumnIndex].cards.push(card);

            this.checkColumnStatus();
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
        this.checkColumnStatus();
        this.checkSecondColumnStatus();
    },
    watch: {
        columns: {
            handler() {
                this.checkColumnStatus();
                this.checkSecondColumnStatus();
            },
            deep: true,
        },
    },
});