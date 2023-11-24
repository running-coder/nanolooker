import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Popover, Space, Tooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

import { BookmarksContext, BookmarkTypes } from "api/contexts/Bookmarks";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import QuestionCircle from "components/QuestionCircle";

interface Props {
  type: BookmarkTypes;
  bookmark: string;
  placement?: TooltipPlacement;
}

const Bookmark: React.FC<Props> = ({ type, bookmark, placement = "top" }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const { bookmarks, addBookmark, removeBookmark } = React.useContext(BookmarksContext);
  const [isOpened, setIsOpened] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [alias, setAlias] = React.useState(bookmarks?.[type]?.[bookmark]);
  const inputRef = React.createRef<InputRef>();

  React.useEffect(() => {
    setAlias(bookmarks?.[type]?.[bookmark]);
  }, [bookmarks, bookmark, type]);

  const onChange = (e: React.ChangeEventHandler<HTMLInputElement>) => {
    // @ts-ignore
    const { value } = e.currentTarget;

    setAlias(value);
  };

  React.useEffect(() => {
    const isBookmarked = typeof bookmarks?.[type]?.[bookmark] !== "undefined";

    setIsBookmarked(isBookmarked);
    if (isBookmarked && isOpened) {
      setAlias(bookmarks[type][bookmark]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmark, bookmarks]);

  const onOpenChange = (isVisible: boolean) => {
    setIsOpened(isVisible);
  };

  React.useEffect(() => {
    if (isOpened) return;

    if (!alias) {
      removeBookmark({
        type,
        bookmark,
      });
    } else {
      addBookmark({
        type,
        bookmark,
        value: alias,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpened]);

  return (
    <Popover
      placement={placement}
      content={
        <div style={{ margin: "0 12px" }}>
          <Space>
            <Input
              ref={inputRef}
              value={alias}
              // @ts-ignore
              onChange={onChange}
              placeholder="Alias"
              maxLength={100}
              autoFocus
              allowClear
            />
          </Space>
        </div>
      }
      title={
        <>
          {t("common.bookmark")}
          <Tooltip
            placement="right"
            title={
              <>
                <div style={{ marginBottom: "6px" }}>{t("tooltips.bookmarks", { type })}</div>
                <Link to={"/bookmarks"}>{t("pages.bookmarks.viewAll")}</Link>
              </>
            }
          >
            <QuestionCircle />
          </Tooltip>
        </>
      }
      trigger="click"
      open={isOpened}
      onOpenChange={onOpenChange}
    >
      <Button
        shape="circle"
        size="small"
        style={{ border: isBookmarked ? "solid 1px gold" : undefined }}
      >
        {theme === Theme.DARK || isBookmarked ? (
          <StarFilled style={{ color: isBookmarked ? "gold" : undefined }} />
        ) : (
          <StarOutlined />
        )}
      </Button>
    </Popover>
  );
};

export default Bookmark;
