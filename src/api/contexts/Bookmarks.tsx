import * as React from "react";

export type BookmarkTypes = "account" | "block";

export interface Bookmarks {
  account: { [bookmark: string]: string }; // { account: alias }
  block: { [bookmark: string]: string }; // { block: alias }
}

interface Context {
  bookmarks: Bookmarks;
  addBookmark: Function;
  removeBookmark: Function;
}

enum LOCALSTORAGE_KEYS {
  BOOKMARKS = "BOOKMARKS",
}

const getBookmarks = (): Bookmarks => {
  let bookmarks;
  try {
    bookmarks = JSON.parse(
      window.localStorage.getItem(LOCALSTORAGE_KEYS.BOOKMARKS) || "",
    );
  } catch (_e) {}

  return bookmarks || {};
};

export const BookmarksContext = React.createContext<Context>({
  bookmarks: {} as Bookmarks,
  addBookmark: () => {},
  removeBookmark: () => {},
});

const Provider: React.FC = ({ children }) => {
  const [bookmarks, setBookmarks] = React.useState(getBookmarks());

  const addBookmark = ({
    type,
    bookmark,
    value,
  }: {
    type: BookmarkTypes;
    bookmark: string;
    value: string;
  }) => {
    if (!value) return;
    const newBookmarks = { ...bookmarks };

    if (!newBookmarks[type]) {
      newBookmarks[type] = {};
    }

    newBookmarks[type][bookmark] = value;

    // account: string, alias: string
    localStorage.setItem(
      LOCALSTORAGE_KEYS.BOOKMARKS,
      JSON.stringify(newBookmarks),
    );

    setBookmarks(newBookmarks);
  };

  const removeBookmark = ({
    type,
    bookmark,
  }: {
    type: BookmarkTypes;
    bookmark: string;
  }) => {
    const newBookmarks = { ...bookmarks };

    if (!newBookmarks[type]?.[bookmark]) {
      return;
    }

    delete newBookmarks[type][bookmark];

    localStorage.setItem(
      LOCALSTORAGE_KEYS.BOOKMARKS,
      JSON.stringify(newBookmarks),
    );

    setBookmarks(newBookmarks);
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export default Provider;
