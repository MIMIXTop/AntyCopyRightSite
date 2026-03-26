import React, { useState } from 'react';
import { Layout, Empty, Spin, Typography, Avatar, Input, Row, Col, Card, Table, Tag, Button, Statistic } from 'antd';
import { FileTextOutlined, SearchOutlined, BookOutlined, ArrowLeftOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useClassroom } from "./ClassroomContext.tsx";

const { Content } = Layout;
const { Title, Text } = Typography;

export const AppContent: React.FC = () => {
    const {
        courses, activeCourseId, activeCourseWorkId, courseWorkMap, submissionsMap,
        loadingWork, loadingCourses, loadingSubmissions, selectCourse, selectCourseWork, studentsMap
    } = useClassroom();

    const [searchQuery, setSearchQuery] = useState('');

    // --- 1. РЕЖИМ ГЛАВНОЙ (DASHBOARD) ---
    if (activeCourseId === 'dashboard' || !activeCourseId) {
        const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>Курсы</Title>
                    <Input
                        placeholder="Поиск курсов..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: 300 }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </div>

                {loadingCourses ? (
                    <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredCourses.map(course => (
                            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{
                                            height: 100,
                                            background: '#1677ff',
                                            padding: 16,
                                            backgroundImage: 'url(https://www.gstatic.com/classroom/themes/img_graduation.jpg)',
                                            backgroundSize: 'cover'
                                        }} />
                                    }
                                    onClick={() => selectCourse(course.id)}
                                >
                                    <Card.Meta
                                        avatar={<Avatar icon={<BookOutlined />} />}
                                        title={course.name}
                                        description={course.section || 'Основной раздел'}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
                {filteredCourses.length === 0 && !loadingCourses && <Empty description="Курсы не найдены" />}
            </Content>
        );
    }

    const activeCourse = courses.find(c => c.id === activeCourseId);

    // --- 2. РЕЖИМ СТРАНИЦЫ ЗАДАНИЯ (СДАЧИ И СЧЕТЧИК) ---
    if (activeCourseWorkId) {
        const assignments = courseWorkMap[activeCourseId] || [];
        const currentWork = assignments.find(w => w.id === activeCourseWorkId);
        const submissions = submissionsMap[activeCourseWorkId] || [];

        const turnedInCount = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
        const totalStudents = submissions.length;
        const courseStudents = activeCourseId ? studentsMap[activeCourseId] || [] : [];

        const columns = [
            {
                title: 'ID Студента',
                dataIndex: 'userId',
                key: 'userId',
                render: (userId: string) => {
                    const student = courseStudents.find(s => s.userId === userId);

                    // Если нашли, берем его имя. Если нет — просто выводим ID
                    const name = student?.profile?.name?.fullName || `Пользователь ${userId}`;

                    // БЕЗОПАСНАЯ ОБРАБОТКА АВАТАРА
                    let avatarSrc: string | undefined = undefined;
                    const rawPhotoUrl = student?.profile?.photoUrl;

                    if (rawPhotoUrl) {
                        // Если ссылка начинается с '//', добавляем 'https:'
                        avatarSrc = rawPhotoUrl.startsWith('//') ? `https:${rawPhotoUrl}` : rawPhotoUrl;
                    }

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Если avatarSrc === undefined, Ant Design просто покажет иконку UserOutlined */}
                            <Avatar
                                src={avatarSrc}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#1677ff' }} // Цвет фона для дефолтной иконки
                            />
                            <span style={{ fontWeight: 500 }}>{name}</span>
                        </div>
                    );
                }
            },
            {
                title: 'Статус',
                dataIndex: 'state',
                key: 'state',
                render: (state: string) => {
                    if (state === 'TURNED_IN') return <Tag color="green">Сдано</Tag>;
                    if (state === 'RETURNED') return <Tag color="blue">Оценено</Tag>;
                    return <Tag color="default">Назначено</Tag>;
                }
            },
            {
                title: 'Дата сдачи',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (time: string) => time ? new Date(time).toLocaleString() : 'Нет данных'
            },
            {
                title: 'Действие',
                key: 'action',
                render: (_: any, record: any) => (
                    <Button type="link" href={record.alternateLink} target="_blank">Проверить работу</Button>
                )
            }
        ];

        return (
            <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => selectCourseWork(null)}
                    style={{ marginBottom: 20 }}
                >
                    Назад к ленте курса
                </Button>

                <Card>
                    <Title level={3}>{currentWork?.title}</Title>
                    <Text type="secondary">{currentWork?.description}</Text>

                    <Row gutter={32} style={{ marginTop: 24, marginBottom: 24 }}>
                        <Col>
                            <Statistic
                                title="Сдали работу"
                                value={turnedInCount}
                                suffix={`/ ${totalStudents}`}
                                // ИСПРАВЛЕНО: Используем styles.content вместо valueStyle
                                styles={{ content: { color: '#3f8600' } }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Col>
                    </Row>

                    <Table
                        dataSource={submissions.map(s => ({ ...s, key: s.id }))}
                        columns={columns}
                        loading={loadingSubmissions}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </Content>
        );
    }

    // --- 3. РЕЖИМ СТРАНИЦЫ КУРСА (ЛЕНТА ЗАДАНИЙ) ---
    const assignments = courseWorkMap[activeCourseId] || [];
    const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    height: '240px', borderRadius: '8px', marginBottom: '24px', padding: '24px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('https://www.gstatic.com/classroom/themes/img_graduation.jpg')`,
                    backgroundSize: 'cover', backgroundPosition: 'center', color: 'white'
                }}>
                    <Title level={1} style={{ color: 'white', margin: 0 }}>{activeCourse?.name}</Title>
                    <Text style={{ color: 'white', fontSize: '18px' }}>{activeCourse?.section}</Text>
                </div>

                {/* Поиск заданий */}
                <div style={{ marginBottom: 24 }}>
                    <Input
                        placeholder="Поиск заданий..."
                        prefix={<SearchOutlined />}
                        size="large"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </div>

                {loadingWork ? (
                    <div style={{ textAlign: 'center', marginTop: 40 }}><Spin /></div>
                ) : (
                    // ИСПРАВЛЕНО: Убрали <List> и используем обычный map внутри flex-контейнера
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredAssignments.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => selectCourseWork(item.id)}
                                style={{
                                    background: 'white', borderRadius: '8px', border: '1px solid #dadce0',
                                    padding: '16px 20px', display: 'flex', alignItems: 'center', cursor: 'pointer',
                                    transition: 'box-shadow 0.2s, background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#5f6368', marginRight: '16px' }} size="large" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#3c4043' }}>{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredAssignments.length === 0 && !loadingWork && <Empty description="Задания не найдены" />}
            </div>
        </Content>
    );
};