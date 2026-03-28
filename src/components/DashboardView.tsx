import React from 'react';
import { Row, Col, Card, Avatar, Typography, Input, Spin } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import type {Course} from '../types/auth';

const { Title } = Typography;

interface Props {
    courses: Course[];
    loading: boolean;
    search: string;
    onSearch: (v: string) => void;
    onSelect: (id: string) => void;
}

export const DashboardView: React.FC<Props> = ({ courses, loading, search, onSearch, onSelect }) => (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>Курсы</Title>
            <Input placeholder="Поиск курсов..." prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => onSearch(e.target.value)} allowClear />
        </div>
        {loading ? <Spin size="large" style={{ display: 'block', margin: '50px auto' }} /> : (
            <Row gutter={[16, 16]}>
                {courses.map(course => (
                    <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                        <Card hoverable onClick={() => onSelect(course.id)} cover={<div style={{ height: 100, background: '#1677ff', backgroundImage: 'url(https://www.gstatic.com/classroom/themes/img_graduation.jpg)', backgroundSize: 'cover' }} />}>
                            <Card.Meta avatar={<Avatar icon={<BookOutlined />} />} title={course.name} description={course.section || 'Основной раздел'} />
                        </Card>
                    </Col>
                ))}
            </Row>
        )}
    </div>
);