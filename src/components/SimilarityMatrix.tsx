import { Table, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FileMeta } from '../types/auth';

interface SimilarityDataItem {
    id: string;
    similarity: Array<{ id: string; value: number }>;
}

interface DataSourceRow {
    key: string;
    rowHeader: string;
    [columnId: string]: number | string;
}

interface Props {
    data: SimilarityDataItem[] | null;
    metaMap: Record<string, FileMeta>;
}

export const SimilarityMatrix: React.FC<Props> = ({ data, metaMap }) => {
    if (!data) return <Empty description="Выберите файлы и запустите анализ" />;

    const columns: ColumnsType<DataSourceRow> = [{ title: 'Файл / Студент', dataIndex: 'rowHeader', key: 'rowHeader', fixed: 'left', width: 220 }];

    data.forEach(item => {
        const meta = metaMap[item.id];
        columns.push({
            title: meta ? <div style={{ fontSize: '10px' }}><b>{meta.studentName}</b><br/>{meta.fileName}</div> : '?',
            dataIndex: item.id,
            key: item.id,
            align: 'center',
            width: 120,
            render: (v: number) => (
                <Tag color={v >= 0.99 ? 'default' : v > 0.6 ? 'red' : v > 0.3 ? 'orange' : 'green'}>
                    {(v * 100).toFixed(1)}%
                </Tag>
            )
        });
    });

    const dataSource: DataSourceRow[] = data.map(item => ({
        key: item.id,
        rowHeader: `${metaMap[item.id]?.studentName}\n(${metaMap[item.id]?.fileName})`,
        ...Object.fromEntries(item.similarity.map((s) => [s.id, s.value]))
    }));

    return <Table dataSource={dataSource} columns={columns} scroll={{ x: 'max-content' }} bordered pagination={false} />;
};