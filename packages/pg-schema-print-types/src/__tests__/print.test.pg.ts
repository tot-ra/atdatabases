import PgDataTypeID from '@databases/pg-data-type-id';
import getSchema, {connect, sql} from '@databases/pg-schema-introspect';
import PgPrintContext from '../PgPrintContext';
import getTypeScriptType from '../getTypeScriptType';
import PrintOptions from '../PgPrintOptions';
import printSchema from '../printers/printSchema';
import {writeFiles} from '@databases/shared-print-types';

const db = connect({bigIntMode: 'number'});

afterAll(async () => {
  await db.dispose();
});
test('getClasses', async () => {
  await db.query(sql`CREATE SCHEMA print_types`);
  await db.query(
    sql`
      CREATE TABLE print_types.users (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        screen_name TEXT UNIQUE NOT NULL,
        bio TEXT,
        age INT,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
      );
      CREATE TABLE print_types.photos (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        owner_user_id BIGINT NOT NULL REFERENCES print_types.users(id),
        cdn_url TEXT NOT NULL,
        caption TEXT NULL,
        metadata JSONB NOT NULL,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
      );
      CREATE MATERIALIZED VIEW print_types.view_a AS SELECT * FROM print_types.users;
      CREATE VIEW print_types.view_b AS SELECT * FROM print_types.photos;

      COMMENT ON TABLE print_types.photos IS 'This is a great table';
      COMMENT ON VIEW print_types.view_b IS 'This is a great view';
    `,
  );

  const schema = await getSchema(db, {
    schemaName: 'print_types',
  });

  const printContext = new PgPrintContext(
    getTypeScriptType,
    schema,
    new PrintOptions({
      tableTypeName: '{{ TABLE_NAME | singular | pascal-case }}',
      columnTypeOverrides: {
        'photos.cdn_url': 'string & {__brand?: "url"}',
      },
      typeOverrides: {
        [PgDataTypeID.jsonb]: 'unknown',
      },
      tableReExportFileName: null,
      tableInsertParametersReExportFileName: null,
    }),
  );
  printSchema(schema, printContext);
  await writeFiles({
    context: printContext.printer,
    directory: `${__dirname}/../../../pg-typed/src/__tests__/__generated__`,
    generatedStatement: 'Generated by: @databases/pg-schema-print-types',
  });

  expect(printContext.printer.getFiles()).toMatchInlineSnapshot(`
    Array [
      Object {
        "content": "import Photo, {Photos_InsertParameters} from './photos'
    import User, {Users_InsertParameters} from './users'

    interface DatabaseSchema {
      photos: {record: Photo, insert: Photos_InsertParameters};
      users: {record: User, insert: Users_InsertParameters};
    }
    export default DatabaseSchema;

    /**
     * JSON serialize values (v) if the table name (t) and column name (c)
     * is a JSON or JSONB column.
     * This is necessary if you want to store values that are not plain objects
     * in a JSON or JSONB column.
     */
    function serializeValue(t: string, c: string, v: unknown): unknown {
      if (t === \\"photos\\" && c === \\"metadata\\") {
        return JSON.stringify(v);
      }
      return v;
    }
    export {serializeValue}
    ",
        "filename": "index.ts",
      },
      Object {
        "content": "import User from './users'

    /**
     * This is a great table
     */
    interface Photo {
      caption: (string) | null
      cdn_url: string & {__brand?: \\"url\\"}
      created_at: (Date) | null
      /**
       * @default nextval('print_types.photos_id_seq'::regclass)
       */
      id: number & {readonly __brand?: 'photos_id'}
      metadata: unknown
      owner_user_id: User['id']
      updated_at: (Date) | null
    }
    export default Photo;

    /**
     * This is a great table
     */
    interface Photos_InsertParameters {
      caption?: (string) | null
      cdn_url: string & {__brand?: \\"url\\"}
      created_at?: (Date) | null
      /**
       * @default nextval('print_types.photos_id_seq'::regclass)
       */
      id?: number & {readonly __brand?: 'photos_id'}
      metadata: unknown
      owner_user_id: User['id']
      updated_at?: (Date) | null
    }
    export type {Photos_InsertParameters}
    ",
        "filename": "photos.ts",
      },
      Object {
        "content": "interface User {
      age: (number) | null
      bio: (string) | null
      created_at: (Date) | null
      /**
       * @default nextval('print_types.users_id_seq'::regclass)
       */
      id: number & {readonly __brand?: 'users_id'}
      screen_name: string
      updated_at: (Date) | null
    }
    export default User;

    interface Users_InsertParameters {
      age?: (number) | null
      bio?: (string) | null
      created_at?: (Date) | null
      /**
       * @default nextval('print_types.users_id_seq'::regclass)
       */
      id?: number & {readonly __brand?: 'users_id'}
      screen_name: string
      updated_at?: (Date) | null
    }
    export type {Users_InsertParameters}
    ",
        "filename": "users.ts",
      },
      Object {
        "content": "[
      {
        \\"name\\": \\"photos\\",
        \\"columns\\": [
          {
            \\"name\\": \\"caption\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 25,
            \\"typeName\\": \\"TEXT\\"
          },
          {
            \\"name\\": \\"cdn_url\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": false,
            \\"typeId\\": 25,
            \\"typeName\\": \\"TEXT\\"
          },
          {
            \\"name\\": \\"created_at\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 1184,
            \\"typeName\\": \\"TIMESTAMPTZ\\"
          },
          {
            \\"name\\": \\"id\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": true,
            \\"typeId\\": 20,
            \\"typeName\\": \\"BIGINT\\"
          },
          {
            \\"name\\": \\"metadata\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": false,
            \\"typeId\\": 3802,
            \\"typeName\\": \\"JSONB\\"
          },
          {
            \\"name\\": \\"owner_user_id\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": false,
            \\"typeId\\": 20,
            \\"typeName\\": \\"BIGINT\\"
          },
          {
            \\"name\\": \\"updated_at\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 1184,
            \\"typeName\\": \\"TIMESTAMPTZ\\"
          }
        ]
      },
      {
        \\"name\\": \\"users\\",
        \\"columns\\": [
          {
            \\"name\\": \\"age\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 23,
            \\"typeName\\": \\"INTEGER\\"
          },
          {
            \\"name\\": \\"bio\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 25,
            \\"typeName\\": \\"TEXT\\"
          },
          {
            \\"name\\": \\"created_at\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 1184,
            \\"typeName\\": \\"TIMESTAMPTZ\\"
          },
          {
            \\"name\\": \\"id\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": true,
            \\"typeId\\": 20,
            \\"typeName\\": \\"BIGINT\\"
          },
          {
            \\"name\\": \\"screen_name\\",
            \\"isNullable\\": false,
            \\"hasDefault\\": false,
            \\"typeId\\": 25,
            \\"typeName\\": \\"TEXT\\"
          },
          {
            \\"name\\": \\"updated_at\\",
            \\"isNullable\\": true,
            \\"hasDefault\\": false,
            \\"typeId\\": 1184,
            \\"typeName\\": \\"TIMESTAMPTZ\\"
          }
        ]
      }
    ]
    ",
        "filename": "schema.json",
      },
    ]
  `);
});
