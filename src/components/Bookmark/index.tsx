import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Input, Popover, Space, Tooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { BookmarksContext, BookmarkTypes } from "api/contexts/Bookmarks";
import QuestionCircle from "components/QuestionCircle";

interface Props {
  type: BookmarkTypes;
  bookmark: string;
  placement?: TooltipPlacement;
}

const Bookmark: React.FC<Props> = ({ type, bookmark, placement = "top" }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const { bookmarks, addBookmark, removeBookmark } = React.useContext(
    BookmarksContext,
  );
  const [isOpened, setIsOpened] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [alias, setAlias] = React.useState(bookmarks?.[type]?.[bookmark]);
  const inputRef = React.createRef<Input>();

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

  const onVisibleChange = (isVisible: boolean) => {
    if (!alias && !isVisible) {
      removeBookmark({
        type,
        bookmark,
      });
    }

    setIsOpened(isVisible);
  };

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
            <Button
              style={{ padding: "0 12px" }}
              type="primary"
              onClick={() => {
                addBookmark({
                  type,
                  bookmark,
                  value: alias,
                });
                setIsOpened(false);
              }}
            >
              Ok
            </Button>
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
                <div style={{ marginBottom: "6px" }}>
                  {t("tooltips.bookmarks", { type })}
                </div>
                <Link to={"/bookmarks"}>{t("pages.bookmarks.viewAll")}</Link>
              </>
            }
          >
            <QuestionCircle />
          </Tooltip>
        </>
      }
      trigger="click"
      visible={isOpened}
      onVisibleChange={onVisibleChange}
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
