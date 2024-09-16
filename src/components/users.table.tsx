import Table from 'react-bootstrap/Table';
import { useState, forwardRef } from 'react';
import Button from 'react-bootstrap/Button';
import UserCreateModal from './modal/user.create.modal';
import UserEditModal from './modal/user.edit.modal';
import UserDeleteModal from './modal/user.delete.modal';
import UsersPagination from './pagination/users.pagination';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface IUser {
    id: number;
    name: string;
    email: string;
}

function UsersTable() {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const PAGE_SIZE = 2;

    const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);

    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
    const [dataUser, setDataUser] = useState({});

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

    const handleEditUser = (user: any) => {
        setDataUser(user);
        setIsOpenUpdateModal(true);
    }

    const handleDelete = (user: any) => {
        setDataUser(user);
        setIsOpenDeleteModal(true);
    }

    const PopoverComponent = forwardRef((props: any, ref: any) => {
        const { id } = props;

        const { isPending, error, data } = useQuery({
            queryKey: ['fetchUser', id],
            queryFn: (): Promise<IUser> =>
                fetch(`http://localhost:8000/users/${id}`).then((res) => {
                    return res.json();
                }
                ),
        })

        console.log(isPending, error, data);

        const getBody = () => {
            if (isPending) return 'Loading detail...'
            if (error) return 'An error has occurred: ' + error.message
            if (data) {
                return (
                    <>
                        <div>ID = {id}</div>
                        <div>Name = {data?.name}</div>
                        <div>Email = {data?.email}</div>
                    </>
                )
            }
        }

        return (

            <Popover ref={ref} {...props}>
                <Popover.Header as="h3">Detail User</Popover.Header>
                <Popover.Body>
                    {getBody()}
                </Popover.Body>
            </Popover>
        )
    })

    const { isPending, error, data } = useQuery({
        queryKey: ['fetchUser'],
        queryFn: (): Promise<IUser[]> =>
            fetch(`http://localhost:8000/users?_page=${currentPage}&_limit=${PAGE_SIZE}`).then((res) => {
                const total_item = +(res.headers.get("X-Total-Count") ?? 0)
                const page_size = PAGE_SIZE;
                const total_pages = total_item === 0 ? 0 : (total_item - 1) / page_size + 1;
                setTotalPages(total_pages);
                return res.json();
            }
            ),
            placeholderData: keepPreviousData
    })

    const users = data;

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message


    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0" }}>
                <h4>Table Users</h4>
                <Button variant="primary"
                    onClick={() => setIsOpenCreateModal(true)}
                >Add New</Button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map(user => {
                        return (
                            <tr key={user.id}>
                                <OverlayTrigger trigger="click" placement="right"
                                    rootClose
                                    overlay={<PopoverComponent id={user.id} />}
                                >
                                    <td><a href='#'>{user.id}</a></td>
                                </OverlayTrigger>

                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        Edit
                                    </Button>&nbsp;&nbsp;&nbsp;
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(user)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            <UsersPagination
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <UserCreateModal
                isOpenCreateModal={isOpenCreateModal}
                setIsOpenCreateModal={setIsOpenCreateModal}
            />

            <UserEditModal
                isOpenUpdateModal={isOpenUpdateModal}
                setIsOpenUpdateModal={setIsOpenUpdateModal}
                dataUser={dataUser}
            />

            <UserDeleteModal
                dataUser={dataUser}
                isOpenDeleteModal={isOpenDeleteModal}
                setIsOpenDeleteModal={setIsOpenDeleteModal}
            />
        </>
    );
}

export default UsersTable;