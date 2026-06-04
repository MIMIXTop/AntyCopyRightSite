import React from 'react';
import { Button, Card, Descriptions, Empty, Modal, Space, Spin, Statistic, Table, Tag, Typography, message, type TableProps } from 'antd';
import type { AnalyzeDocumentPairSummary, AnalyzeFragmentsResponse, AnalyzePairSection, AnalyzeResponse, FileMeta } from '../types/auth';
import { analysisService } from '../services/AnalysisService.ts';

const { Text } = Typography;

interface SimilarityRow {
    key: string;
    rowHeader: string;
    pairMap: Record<string, AnalyzeDocumentPairSummary>;
    [fileId: string]: string | number | Record<string, AnalyzeDocumentPairSummary>;
}

interface Props {
    data: AnalyzeResponse | null;
    metaMap: Record<string, FileMeta>;
}

const levelColor = (similarity: number) => {
    if (similarity >= 0.85) return 'red';
    if (similarity >= 0.6) return 'orange';
    if (similarity > 0) return 'green';
    return 'default';
};

const formatPercent = (similarity: number) => `${(similarity * 100).toFixed(1)}%`;

const fileLabel = (fileId: string, metaMap: Record<string, FileMeta>) => {
    const meta = metaMap[fileId];
    return meta ? `${meta.studentName} (${meta.fileName})` : fileId;
};

const sectionLabel = (section: AnalyzePairSection) =>
    section.left.title === section.right.title
        ? section.left.title
        : `${section.left.title} ↔ ${section.right.title}`;

export const SimilarityMatrix: React.FC<Props> = ({ data, metaMap }) => {
    const [selectedPair, setSelectedPair] = React.useState<AnalyzeDocumentPairSummary | null>(null);
    const [fragmentReport, setFragmentReport] = React.useState<AnalyzeFragmentsResponse | null>(null);
    const [selectedFragmentName, setSelectedFragmentName] = React.useState<string | null>(null);
    const [loadingFragmentReport, setLoadingFragmentReport] = React.useState(false);
    const [isFragmentReportOpen, setIsFragmentReportOpen] = React.useState(false);

    const openPairDetails = (pair: AnalyzeDocumentPairSummary) => {
        setSelectedPair(pair);
        setFragmentReport(null);
        setSelectedFragmentName(null);
    };

    const closePairDetails = () => {
        setSelectedPair(null);
        setFragmentReport(null);
        setSelectedFragmentName(null);
        setIsFragmentReportOpen(false);
    };

    const handleOpenFragmentReport = async (section: AnalyzePairSection) => {
        if (!selectedPair) return;

        const fragmentName = section.left.normalized_title || section.left.title;
        setLoadingFragmentReport(true);
        setSelectedFragmentName(sectionLabel(section));
        setFragmentReport(null);
        setIsFragmentReportOpen(true);

        try {
            const report = await analysisService.analyzeFragments({
                first_doc_id: selectedPair.left_document_id,
                second_doc_id: selectedPair.right_document_id,
                fragment_name: fragmentName,
            });

            setFragmentReport(report);
        } catch (error) {
            console.error('Failed to fetch fragment report:', error);
            message.error('Не удалось загрузить подсветку фрагмента');
            setFragmentReport(null);
        } finally {
            setLoadingFragmentReport(false);
        }
    };

    if (!data) return <Empty description="Выберите файлы и запустите анализ" />;
    if (!data.document_inventory.length) return <Empty description="В ответе анализа нет документов" />;

    const documentIds = data.document_inventory.map(doc => doc.document_id);
    const pairMap = new Map<string, AnalyzeDocumentPairSummary>();

    data.document_pair_summaries.forEach(pair => {
        pairMap.set(`${pair.left_document_id}:${pair.right_document_id}`, pair);
        pairMap.set(`${pair.right_document_id}:${pair.left_document_id}`, pair);
    });

    const columns: TableProps<SimilarityRow>['columns'] = [
        {
            title: 'Файл / Студент',
            dataIndex: 'rowHeader',
            key: 'rowHeader',
            fixed: 'left',
            width: 260,
            render: (value: SimilarityRow['rowHeader']) => <Text style={{ whiteSpace: 'pre-line' }}>{value}</Text>
        }
    ];

    documentIds.forEach(fileId => {
        const meta = metaMap[fileId];
        columns.push({
            title: meta ? <div style={{ fontSize: '10px' }}><b>{meta.studentName}</b><br />{meta.fileName}</div> : fileId,
            dataIndex: fileId,
            key: fileId,
            align: 'center',
            width: 120,
            render: (value: SimilarityRow[string], row) => {
                const similarity = Number(value);
                if (!Number.isFinite(similarity)) return <Text type="secondary">—</Text>;
                if (similarity === 1) return <Tag color="default">100.0%</Tag>;

                const pair = row.pairMap[fileId];
                if (!pair) return <Text type="secondary">—</Text>;

                return (
                    <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, height: 'auto' }}
                        onClick={() => openPairDetails(pair)}
                    >
                        <Tag color={levelColor(similarity)}>{formatPercent(similarity)}</Tag>
                    </Button>
                );
            }
        });
    });

    const dataSource = documentIds.map(sourceId => {
        const row: SimilarityRow = {
            key: sourceId,
            rowHeader: fileLabel(sourceId, metaMap).replace(' (', '\n('),
            pairMap: {}
        };

        documentIds.forEach(targetId => {
            if (sourceId === targetId) {
                row[targetId] = 1;
                return;
            }

            const pair = pairMap.get(`${sourceId}:${targetId}`);
            row[targetId] = pair?.similarity ?? Number.NaN;
            if (pair) row.pairMap[targetId] = pair;
        });

        return row;
    });

    return (
        <>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Space wrap size={24}>
                    <Statistic title="Документов" value={data.documents} />
                    <Statistic title="Пар сравнено" value={data.document_pair_summaries.length} />
                    <Statistic title="Сопоставимых разделов" value={data.comparable_sections} />
                </Space>

                {data.skipped_sections.length > 0 && (
                    <Space direction="vertical" size={4}>
                        {data.skipped_sections.map((item, index) => (
                            <Text key={`${item.document_id}-${item.label}-${index}`} type="warning">
                                Пропущен раздел {item.label}: {item.title}
                            </Text>
                        ))}
                    </Space>
                )}

                <Table
                    dataSource={dataSource}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    bordered={false}
                    pagination={false}
                    expandable={{
                        expandedRowRender: (row) => {
                            const pairs = Object.values(row.pairMap);
                            if (!pairs.length) return <Empty description="Для этого документа нет сравнений" />;

                            return (
                                <Table
                                    size="small"
                                    rowKey={(pair) => `${pair.left_document_id}:${pair.right_document_id}`}
                                    dataSource={pairs}
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'Пара',
                                            key: 'pair',
                                            render: (_, pair) => `${fileLabel(pair.left_document_id, metaMap)} ↔ ${fileLabel(pair.right_document_id, metaMap)}`
                                        },
                                        {
                                            title: 'Документ',
                                            key: 'document',
                                            width: 120,
                                            render: (_, pair) => (
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    style={{ padding: 0, height: 'auto' }}
                                                    onClick={() => openPairDetails(pair)}
                                                >
                                                    <Tag color={levelColor(pair.similarity)}>{formatPercent(pair.similarity)}</Tag>
                                                </Button>
                                            )
                                        },
                                        {
                                            title: 'Разделы',
                                            key: 'sections',
                                            render: (_, pair) => (
                                                <Space direction="vertical" size={6}>
                                                    {pair.sections.map((section, index) => (
                                                        <Text key={`${section.left.label}-${section.right.label}-${index}`}>
                                                            <Tag color={levelColor(section.comparison.similarity)}>
                                                                {formatPercent(section.comparison.similarity)}
                                                            </Tag>
                                                            {sectionLabel(section)}
                                                        </Text>
                                                    ))}
                                                </Space>
                                            )
                                        },
                                        {
                                            title: 'Пар предложений',
                                            key: 'sentences',
                                            width: 160,
                                            render: (_, pair) => <Text type="secondary">{pair.total_sentence_pairs}</Text>
                                        }
                                    ]}
                                />
                            );
                        }
                    }}
                />
            </Space>

            <Modal
                open={Boolean(selectedPair)}
                title={selectedPair ? `${fileLabel(selectedPair.left_document_id, metaMap)} ↔ ${fileLabel(selectedPair.right_document_id, metaMap)}` : 'Детали схожести'}
                onCancel={closePairDetails}
                footer={null}
                width={1180}
            >
                {selectedPair && (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Схожесть документов">
                                <Tag color={levelColor(selectedPair.similarity)}>
                                    {formatPercent(selectedPair.similarity)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Количество разделов">
                                {selectedPair.section_count}
                            </Descriptions.Item>
                            <Descriptions.Item label="Сравнено пар предложений">
                                {selectedPair.total_sentence_pairs}
                            </Descriptions.Item>
                            <Descriptions.Item label="Distance">
                                {selectedPair.distance.toFixed(3)}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedPair.best_section && (
                            <Descriptions bordered size="small" column={1} title="Наиболее похожий раздел">
                                <Descriptions.Item label="Раздел">
                                    {sectionLabel(selectedPair.best_section)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Схожесть">
                                    {formatPercent(selectedPair.best_section.comparison.similarity)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Лучшие предложения">
                                    {selectedPair.best_section.comparison.best_left_sentence} ↔ {selectedPair.best_section.comparison.best_right_sentence}
                                    {' '}({formatPercent(selectedPair.best_section.comparison.best_similarity)})
                                </Descriptions.Item>
                            </Descriptions>
                        )}

                        {selectedPair.worst_section && (
                            <Descriptions bordered size="small" column={1} title="Наименее похожий раздел">
                                <Descriptions.Item label="Раздел">
                                    {sectionLabel(selectedPair.worst_section)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Схожесть">
                                    {formatPercent(selectedPair.worst_section.comparison.similarity)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Лучшие предложения">
                                    {selectedPair.worst_section.comparison.best_left_sentence} ↔ {selectedPair.worst_section.comparison.best_right_sentence}
                                    {' '}({formatPercent(selectedPair.worst_section.comparison.best_similarity)})
                                </Descriptions.Item>
                            </Descriptions>
                        )}

                        <Table
                            size="small"
                            rowKey={(section) => `${section.left.label}:${section.right.label}`}
                            pagination={false}
                            dataSource={selectedPair.sections}
                            columns={[
                                {
                                    title: 'Раздел',
                                    key: 'section',
                                    render: (_, section) => sectionLabel(section)
                                },
                                {
                                    title: 'Схожесть',
                                    key: 'similarity',
                                    width: 120,
                                    render: (_, section) => (
                                        <Tag color={levelColor(section.comparison.similarity)}>
                                            {formatPercent(section.comparison.similarity)}
                                        </Tag>
                                    )
                                },
                                {
                                    title: 'Distance',
                                    key: 'distance',
                                    width: 120,
                                    render: (_, section) => section.comparison.distance.toFixed(3)
                                },
                                {
                                    title: 'Лучшие предложения',
                                    key: 'bestSentences',
                                    render: (_, section) => (
                                        <Text type="secondary">
                                            {section.comparison.best_left_sentence} ↔ {section.comparison.best_right_sentence}
                                            {' '}({formatPercent(section.comparison.best_similarity)})
                                        </Text>
                                    )
                                },
                                {
                                    title: 'Подсветка',
                                    key: 'fragmentReport',
                                    width: 130,
                                    render: (_, section) => (
                                        <Button
                                            size="small"
                                            loading={loadingFragmentReport && selectedFragmentName === sectionLabel(section)}
                                            onClick={() => handleOpenFragmentReport(section)}
                                        >
                                            Показать
                                        </Button>
                                    )
                                }
                            ]}
                            locale={{ emptyText: 'Для этой пары нет данных по разделам' }}
                        />
                    </Space>
                )}
            </Modal>

            <Modal
                open={isFragmentReportOpen}
                onCancel={() => setIsFragmentReportOpen(false)}
                footer={null}
                width="96vw"
                style={{ top: 18 }}
                styles={{
                    body: { padding: 0 },
                }}
            >
                <div style={{ background: '#f0f2f5', padding: 20, minHeight: 620 }}>
                    <h2 style={{ margin: '0 0 18px', fontSize: 26, lineHeight: 1.2 }}>
                        Дифференцированное выделение блоков плагиата
                    </h2>
                    {selectedFragmentName && (
                        <Text type="secondary" style={{ display: 'block', marginBottom: 18 }}>
                            Фрагмент: {selectedFragmentName}
                        </Text>
                    )}

                    {loadingFragmentReport && !fragmentReport ? (
                        <Card variant="borderless" style={{ minHeight: 240 }}>
                            <Spin tip="Загрузка подсветки фрагмента..." />
                        </Card>
                    ) : fragmentReport && selectedPair ? (
                        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                            <div
                                style={{
                                    flex: 1,
                                    background: '#fff',
                                    padding: 20,
                                    borderRadius: 8,
                                    lineHeight: 1.6,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    minHeight: 520,
                                }}
                            >
                                <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Документ 1</h3>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 18 }}>
                                    {fileLabel(selectedPair.left_document_id, metaMap)}
                                </Text>
                                <div dangerouslySetInnerHTML={{ __html: fragmentReport[0] }} />
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    background: '#fff',
                                    padding: 20,
                                    borderRadius: 8,
                                    lineHeight: 1.6,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    minHeight: 520,
                                }}
                            >
                                <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Документ 2</h3>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 18 }}>
                                    {fileLabel(selectedPair.right_document_id, metaMap)}
                                </Text>
                                <div dangerouslySetInnerHTML={{ __html: fragmentReport[1] }} />
                            </div>
                        </div>
                    ) : (
                        <Empty description="Подсветка фрагмента не загружена" />
                    )}
                </div>
            </Modal>
        </>
    );
};
