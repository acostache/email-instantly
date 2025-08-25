import knex from 'knex';

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
});

export class DB {
    static async addLead(data) {
        return db('leads').insert(data);
    }

    static async getEmails() {
        return db('emails').select('*').orderBy('id', 'desc');
    }

    static async addEmail(email) {
        // Expect shape: { to, cc, bcc, subject, body }
        return db('emails').insert(email);
    }
}
