create table comment
(
    id      integer not null
        constraint comment_pk
            primary key autoincrement,
    name    text not null,
    content text not null
);