import PageBreadcrumb from '@/components/PageBreadcrumb';
import { Col, Container, Row } from 'react-bootstrap';
import ProductReviews from './components/ProductReviews';
const Index = () => {
  return <Container fluid>
      <PageBreadcrumb title="Reviews" subtitle="Ecommerce" />
      <Row className="justify-content-center">
        <Col xxl={12}>
          <ProductReviews />
        </Col>
      </Row>
    </Container>;
};
export default Index;