import { Table, Checkbox, Skeleton } from "@mantine/core";

export function JobsTableSkeleton() {
  const skeletonRows = Array(10).fill(0);

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>
              <Checkbox disabled />
            </Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th w="40%">Salary</Table.Th>
            <Table.Th w={120}>Remote</Table.Th>
            <Table.Th w={120}>Status</Table.Th>
            <Table.Th w={50} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {skeletonRows.map((_, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Skeleton height={20} width={20} radius={0} />
              </Table.Td>
              <Table.Td>
                <Skeleton height={20} width="80%" radius={0} />
              </Table.Td>
              <Table.Td>
                <Skeleton height={20} width="60%" radius={0} />
              </Table.Td>
              <Table.Td>
                <Skeleton height={20} width={80} radius={0} />
              </Table.Td>
              <Table.Td>
                <Skeleton height={20} width={70} radius={0} />
              </Table.Td>
              <Table.Td>
                <Skeleton height={20} width={20} radius={0} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
