import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { Card, Col, Empty, Row, Typography } from "antd";

import { BookmarksContext } from "api/contexts/Bookmarks";
import AccountHeader from "pages/Account/Header/Account";

const { Title } = Typography;

const BookmarksPage: React.FC = () => {
  const { t } = useTranslation();
  const { bookmarks } = React.useContext(BookmarksContext);
  const hasAccountBookmarks = !!Object.keys(bookmarks?.account || {}).length;

  return (
    <>
      <Helmet>
        <title>{t("common.bookmarks")}</title>
      </Helmet>
      <Title level={3}>{t("common.bookmarks")}</Title>
      <Card size="small" className="detail-layout">
        {hasAccountBookmarks ? (
          Object.entries(bookmarks?.account).map(([account, alias]) => (
            <Row gutter={6} key={account}>
              <Col xs={24} sm={8} md={6}>
                {alias}
              </Col>
              <Col xs={24} sm={16} md={18}>
                <AccountHeader account={account} isLink />
              </Col>
            </Row>
          ))
        ) : (
          <Row>
            <Col xs={24} style={{ textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("pages.bookmarks.noBookmarksFound")}
                style={{ padding: "12px" }}
              />
            </Col>
          </Row>
        )}
      </Card>
    </>
  );
};

export default BookmarksPage;
