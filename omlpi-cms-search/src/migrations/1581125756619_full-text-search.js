/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('unaccent', { ifNotExists: true });

  // Add the tsvector column
  pgm.addColumn('artigos', { tsv: { type: 'tsvector' } });

  // Create gin index on tsv column
  pgm.createIndex('artigos', 'tsv', {
    name: 'artigos_tsv_idx',
    method: 'gin',
  });

  // Helper function to update tsvector column by artigo_id
  pgm.createFunction(
    'f_artigos_tsv_update',
    [
      {
        name: '_artigo_id',
        type: 'int',
      },
    ],
    {
      returns: 'void',
      language: 'plpgsql',
      replace: true,
    },
    `declare
      tags_str varchar;
    begin

      select string_agg(unaccent(tags.name), ' ') into tags_str
      from artigos__tags
      join tags
        on artigos__tags.tag_id = tags.id
      where artigos__tags.artigo_id = _artigo_id;

      update artigos
        set tsv = setweight(to_tsvector('portuguese', unaccent(title)), 'A')
               || setweight(to_tsvector('portuguese', concat_ws(' ', author, organization)), 'B')
               || setweight(to_tsvector('portuguese', coalesce(tags_str, '')), 'C')
      where id = _artigo_id;

    end;`,
  );

  // Create or update an article
  pgm.createFunction(
    'tf_artigos_tsv_update',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
      declare
        tags_str varchar;
      begin

        select string_agg(unaccent(tags.name), ' ') into tags_str
        from artigos__tags
        join tags
          on artigos__tags.tag_id = tags.id
        where artigos__tags.artigo_id = NEW.id;

        NEW.tsv = setweight(to_tsvector('portuguese', unaccent(NEW.title)), 'A')
               || setweight(to_tsvector('portuguese', CONCAT_WS(' ', NEW.author, NEW.organization)), 'B')
               || setweight(to_tsvector('portuguese', COALESCE(tags_str, '')), 'C');

        return NEW;
      end;
    `,
  );

  pgm.dropTrigger('artigos', 't_artigos_tsv', { ifExists: true });
  pgm.createTrigger('artigos', 't_artigos_tsv', {
    when: 'before',
    operation: ['insert', 'update'],
    level: 'row',
    function: 'tf_artigos_tsv_update',
  });

  // Create an artigos_tags relation
  pgm.createFunction(
    'tf_artigos__tags_tsv_update', [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    'begin '
      + 'perform f_artigos_tsv_update(COALESCE(OLD.artigo_id, NEW.artigo_id)); '
      + 'return NEW; '
      + 'end',
  );
  pgm.dropTrigger('artigos__tags', 't_artigos__tags_create_tsv', { ifExists: true });
  pgm.createTrigger('artigos__tags', 't_artigos__tags_create_tsv', {
    when: 'after',
    operation: ['insert', 'update'],
    level: 'row',
    function: 'tf_artigos__tags_tsv_update',
  });

  // Remove an artigos_tags relation
  pgm.dropTrigger('artigos__tags', 't_artigos__tags_delete_tsv', { ifExists: true });
  pgm.createTrigger('artigos__tags', 't_artigos__tags_delete_tsv', {
    when: 'after',
    operation: ['delete'],
    level: 'row',
    function: 'tf_artigos__tags_tsv_update',
  });

  // Update a tag
  pgm.createFunction('tf_tags_tsv_update', [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `begin
      perform f_artigos_tsv_update(artigo_id)
      from artigos__tags
      where tag_id = NEW.id;

      return NEW;
    end;`);
  pgm.dropTrigger('tags', 't_tags_tsv_update', { ifExists: true });
  pgm.createTrigger('tags', 't_tags_tsv_update', {
    when: 'after',
    operation: ['update'],
    level: 'row',
    function: 'tf_tags_tsv_update',
  });

  // Delete tag
  pgm.createFunction('tf_tags_tsv_delete', [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `begin
      perform f_artigos_tsv_update(artigo_id)
      from artigos__tags
      where tag_id = OLD.id;

      return NEW;
    end;`);
  pgm.dropTrigger('tags', 't_tags_tsv_delete', { ifExists: true });
  pgm.createTrigger('tags', 't_tags_tsv_delete', {
    when: 'after',
    operation: 'delete',
    level: 'row',
    function: 'tf_tags_tsv_delete',
  });

  // Fake update just to generate tsvector for existent data
  pgm.sql('update artigos set id = id');
};

exports.down = (pgm) => {
  pgm.dropTrigger('tags', 't_tags_tsv_delete', { ifExists: true });
  pgm.dropFunction('tf_tags_tsv_delete', [], { ifExists: true });

  pgm.dropTrigger('tags', 't_tags_tsv_update', { ifExists: true });
  pgm.dropFunction('tf_tags_tsv_update', [], { ifExists: true });

  pgm.dropTrigger('artigos__tags', 't_artigos__tags_delete_tsv', { ifExists: true });

  pgm.dropTrigger('artigos__tags', 't_artigos__tags_create_tsv', { ifExists: true });
  pgm.dropFunction('tf_artigos__tags_tsv_update', [], { ifExists: true });

  pgm.dropTrigger('artigos', 't_artigos_tsv', { ifExists: true });

  pgm.dropFunction('tf_artigos_tsv_update', [], { ifExists: true });
  pgm.dropFunction('f_artigos_tsv_update', [], { ifExists: true });

  pgm.dropIndex('artigos', 'tsv', { name: 'artigos_tsv_idx' });
  pgm.dropColumn('artigos', 'tsv');
};
