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
                        <Card
                            hoverable
                            bordered={false} // НЕТ ГРАНИЦ
                            style={{
                                background: '#F3EDF7', // Surface Container
                                transition: '0.3s'
                            }}
                            cover={
                                <div style={{
                                    height: 120,
                                    background: '#D0BCFF', // Пастельный фиолетовый
                                    borderRadius: '16px 16px 0 0'
                                }} />
                            }
                            onClick={() => onSelect(course.id)}
                        >
                            <Card.Meta
                                title={<span style={{ color: '#1D1B20' }}>{course.name}</span>}
                                description={course.section}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        )}
    </div>
);