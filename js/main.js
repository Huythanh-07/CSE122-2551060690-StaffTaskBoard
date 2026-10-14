/* =========================================================================
   StayFlow - Bảng nhiệm vụ (JavaScript tương tác)
   Bao gồm: 
   1. Dữ liệu mẫu nhiệm vụ (Cards) & Khởi tạo giao diện
   2. Chức năng 1: Tìm kiếm và Lọc dữ liệu (Search & Filter)
   3. Chức năng 2: Chuyển đổi trạng thái nhiệm vụ & Đếm số lượng cột
   4. Chức năng 3: Mở/Đóng Modal chi tiết & Hiển thị Toast thông báo
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dữ liệu mẫu các nhiệm vụ trong bảng Kanban
    const tasksData = [
        {
            id: 'SF-3192',
            title: 'Điều hòa không mát',
            room: 'Phòng 908 · Tầng 9',
            shift: 'afternoon', // morning, afternoon, night
            priority: 'high',   // high, medium, low
            zone: 'high',       // high (tầng 5-14), low (tầng 1-4)
            status: 'new',      // new, processing, completed
            time: '18 phút',
            assignee: 'Chưa phân công',
            tag: 'Kỹ thuật',
            note: 'Khách phản hồi điều hòa chạy nhưng không lạnh sâu, cần kiểm tra gas hoặc lưới lọc.',
            deadline: '14:30 - Hôm nay'
        },
        {
            id: 'SF-3190',
            title: 'Bổ sung nước suối',
            room: 'Phòng 1412 · Tầng 14',
            shift: 'afternoon',
            priority: 'medium',
            zone: 'high',
            status: 'new',
            time: '31 phút',
            assignee: 'Chưa phân công',
            tag: 'Tiện nghi',
            note: 'Khách yêu cầu thêm 2 chai nước suối miễn phí.',
            deadline: '15:00 - Hôm nay'
        },
        {
            id: 'SF-3189',
            title: 'Dọn phòng buổi tối',
            room: 'Phòng 602 · Tầng 6',
            shift: 'afternoon',
            priority: 'low',
            zone: 'high',
            status: 'new',
            time: '46 phút',
            assignee: 'Chưa phân công',
            tag: 'Buồng phòng',
            note: 'Thay ga giường và dọn dẹp theo yêu cầu riêng của khách VIP.',
            deadline: '17:00 - Hôm nay'
        },
        {
            id: 'SF-3184',
            title: 'Bổ sung khăn tắm',
            room: 'Phòng 1208 · Tầng 12',
            shift: 'afternoon',
            priority: 'medium',
            zone: 'high',
            status: 'processing',
            time: '08 phút',
            assignee: 'Lan Anh',
            tag: 'Tiện nghi',
            note: 'Yêu cầu thêm 2 khăn tắm lớn và 1 khăn mặt.',
            deadline: '14:15 - Hôm nay'
        },
        {
            id: 'SF-3178',
            title: 'Xử lý khóa cửa',
            room: 'Phòng 510 · Tầng 5',
            shift: 'afternoon',
            priority: 'high',
            zone: 'high',
            status: 'processing',
            time: 'Quá hạn 12 phút',
            isOverdue: true,
            assignee: 'Quang Huy',
            tag: 'Kỹ thuật',
            note: 'Thẻ từ đôi khi không nhận tín hiệu mở cửa.',
            deadline: '13:45 - Hôm nay'
        },
        {
            id: 'SF-3173',
            title: 'Giao bàn ủi',
            room: 'Phòng 1116 · Tầng 11',
            shift: 'morning',
            priority: 'low',
            zone: 'high',
            status: 'completed',
            time: '24 phút xử lý',
            assignee: 'Lan Anh',
            tag: 'Tiện nghi',
            note: 'Khách đã trả lại bàn ủi sau khi sử dụng xong.',
            deadline: '11:30 - Hôm nay'
        },
        {
            id: 'SF-3168',
            title: 'Dọn khay thức ăn',
            room: 'Phòng 702 · Tầng 7',
            shift: 'morning',
            priority: 'medium',
            zone: 'high',
            status: 'completed',
            time: '18 phút xử lý',
            assignee: 'Minh Khoa',
            tag: 'Ẩm thực',
            note: 'Đã thu dọn xe đẩy đồ ăn thừa ở cửa phòng.',
            deadline: '12:00 - Hôm nay'
        }
    ];

    // Tham chiếu các phần tử DOM
    const colNewList = document.querySelector('[data-status="new"] [data-list]');
    const colProcessingList = document.querySelector('[data-status="processing"] [data-list]');
    const colCompletedList = document.querySelector('[data-status="completed"] [data-list]');

    const countNew = document.querySelector('[data-status="new"] [data-count]');
    const countProcessing = document.querySelector('[data-status="processing"] [data-count]');
    const countCompleted = document.querySelector('[data-status="completed"] [data-count]');

    const taskSearch = document.getElementById('taskSearch');
    const filterShift = document.getElementById('filterShift');
    const filterPriority = document.getElementById('filterPriority');
    const filterZone = document.getElementById('filterZone');
    const resultCount = document.getElementById('resultCount');
    const refreshBtn = document.getElementById('refreshBtn');

    // Modal elements
    const taskModal = document.getElementById('taskModal');
    const modalCode = document.getElementById('modalCode');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const modalDismiss = document.getElementById('modalDismiss');
    const modalAdvance = document.getElementById('modalAdvance');
    const toastsContainer = document.getElementById('toasts');

    let currentSelectedTaskId = null;

    // Hàm hiển thị thông báo Toast góc màn hình
    function showToast(message, type = 'default') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'toast--success' : ''}`;
        toast.textContent = message;
        toastsContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Hàm render danh sách nhiệm vụ lên giao diện dựa trên bộ lọc
    function renderBoard(dataToRender = tasksData) {
        // Xóa nội dung cũ
        colNewList.innerHTML = '';
        colProcessingList.innerHTML = '';
        colCompletedList.innerHTML = '';

        let counts = { new: 0, processing: 0, completed: 0 };

        dataToRender.forEach(task => {
            counts[task.status]++;

            const card = document.createElement('li');
            card.className = `card ${task.isOverdue && task.status === 'processing' ? 'card--overdue' : ''}`;
            card.setAttribute('data-id', task.id);

            // Xác định badge độ ưu tiên
            let priorityBadgeClass = 'badge--low';
            if (task.priority === 'high') priorityBadgeClass = 'badge--high';
            else if (task.priority === 'medium') priorityBadgeClass = 'badge--medium';

            const priorityText = task.priority === 'high' ? 'Cao' : (task.priority === 'medium' ? 'Trung bình' : 'Thấp');

            // Nút bấm tương ứng tùy trạng thái cột
            let actionBtnHTML = '';
            if (task.status === 'new') {
                actionBtnHTML = `<button class="btn btn--claim btn-accept-task" type="button">Nhận việc</button>`;
            } else if (task.status === 'processing') {
                actionBtnHTML = `<button class="btn btn--ghost btn-advance-task" type="button">Hoàn thành ✓</button>`;
            } else {
                actionBtnHTML = `<span class="chip-time chip-time--ok">Đã xong</span>`;
            }

            card.innerHTML = `
                <div class="card__top">
                    <span class="card__code">${task.id}</span>
                    <span class="chip-time ${task.isOverdue ? 'chip-time--over' : ''}">${task.time}</span>
                </div>
                <h4 class="card__title">${task.title}</h4>
                <p class="card__meta">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${task.room}
                </p>
                <div class="badges">
                    <span class="badge ${priorityBadgeClass}"><i class="dot"></i>${priorityText}</span>
                    <span class="badge badge--tag">${task.tag}</span>
                </div>
                ${task.isOverdue && task.status === 'processing' ? `
                    <div class="alert-overdue">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        QUÁ HẠN · Cần báo quản lý ngay
                    </div>
                ` : ''}
                <div class="card__foot">
                    <div class="card__assignee">
                        <span>Người nhận:</span> <b>${task.assignee}</b>
                    </div>
                    ${actionBtnHTML}
                </div>
            `;

            // Bấm vào card để mở Modal chi tiết
            card.addEventListener('click', (e) => {
                // Nếu bấm vào nút bấm hành động thì không mở modal
                if (e.target.closest('button')) return;
                openTaskModal(task.id);
            });

            // Gắn card vào đúng cột tương ứng
            if (task.status === 'new') colNewList.appendChild(card);
            else if (task.status === 'processing') colProcessingList.appendChild(card);
            else if (task.status === 'completed') colCompletedList.appendChild(card);
        });

        // Cập nhật số đếm trên tiêu đề cột
        countNew.textContent = counts.new;
        countProcessing.textContent = counts.processing;
        countCompleted.textContent = counts.completed;

        // Hiển thị trạng thái rỗng cho cột nếu không có thẻ
        toggleEmptyColumn(colNewList, counts.new);
        toggleEmptyColumn(colProcessingList, counts.processing);
        toggleEmptyColumn(colCompletedList, counts.completed);

        // Cập nhật kết quả tìm kiếm hiển thị
        if (resultCount) {
            resultCount.textContent = `Hiển thị ${dataToRender.length} / ${tasksData.length} nhiệm vụ`;
        }
    }

    function toggleEmptyColumn(listElement, count) {
        const columnBody = listElement.closest('.column__body');
        if (count === 0) {
            columnBody.classList.add('is-empty');
        } else {
            columnBody.classList.remove('is-empty');
        }
    }

    // ================= CHỨC NĂNG 1: TÌM KIẾM VÀ LỌC DỮ LIỆU =================
    function filterTasks() {
        const keyword = taskSearch.value.toLowerCase().trim();
        const shiftVal = filterShift.value;
        const priorityVal = filterPriority.value;
        const zoneVal = filterZone.value;

        const filtered = tasksData.filter(task => {
            const matchKeyword = task.id.toLowerCase().includes(keyword) || 
                                 task.title.toLowerCase().includes(keyword) || 
                                 task.room.toLowerCase().includes(keyword);
            
            const matchShift = shiftVal === 'all' || task.shift === shiftVal;
            const matchPriority = priorityVal === 'all' || task.priority === priorityVal;
            const matchZone = zoneVal === 'all' || task.zone === zoneVal;

            return matchKeyword && matchShift && matchPriority && matchZone;
        });

        renderBoard(filtered);
    }

    taskSearch.addEventListener('input', filterTasks);
    filterShift.addEventListener('change', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    filterZone.addEventListener('change', filterTasks);

    // ================= CHỨC NĂNG 2: THAY ĐỔI TRẠNG THÁI NHIỆM VỤ =================
    document.addEventListener('click', (e) => {
        // Nút "Nhận việc" ở cột Mới -> chuyển sang Đang xử lý
        if (e.target.classList.contains('btn-accept-task')) {
            const card = e.target.closest('.card');
            const taskId = card.getAttribute('data-id');
            updateTaskStatus(taskId, 'processing', 'Minh Anh');
        }

        // Nút "Hoàn thành" ở cột Đang xử lý -> chuyển sang Hoàn thành
        if (e.target.classList.contains('btn-advance-task')) {
            const card = e.target.closest('.card');
            const taskId = card.getAttribute('data-id');
            updateTaskStatus(taskId, 'completed', 'Minh Anh');
        }
    });

    function updateTaskStatus(taskId, newStatus, assigneeName) {
        const task = tasksData.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            task.assignee = assigneeName;
            if (newStatus === 'completed') {
                task.time = 'Vừa hoàn thành';
                task.isOverdue = false;
            } else if (newStatus === 'processing') {
                task.time = '01 phút';
            }
            renderBoard();
            showToast(`Đã cập nhật trạng thái nhiệm vụ ${taskId} thành công!`, 'success');
        }
    }

    // ================= CHỨC NĂNG 3: MODAL CHI TIẾT & TOAST NOTIFICATION =================
    function openTaskModal(taskId) {
        const task = tasksData.find(t => t.id === taskId);
        if (!task) return;

        currentSelectedTaskId = task.id;
        modalCode.textContent = task.id;
        modalTitle.textContent = task.title;

        let statusText = 'Mới';
        if (task.status === 'processing') statusText = 'Đang xử lý';
        if (task.status === 'completed') statusText = 'Hoàn thành';

        modalBody.innerHTML = `
            <dl class="modal__list">
                <div class="modal__row"><dt>Khu vực phòng:</dt><dd>${task.room}</dd></div>
                <div class="modal__row"><dt>Phân loại dịch vụ:</dt><dd>${task.tag}</dd></div>
                <div class="modal__row"><dt>Mức ưu tiên:</dt><dd><b>${task.priority.toUpperCase()}</b></dd></div>
                <div class="modal__row"><dt>Trạng thái hiện tại:</dt><dd><span class="badge">${statusText}</span></dd></div>
                <div class="modal__row"><dt>Người phụ trách:</dt><dd>${task.assignee}</dd></div>
                <div class="modal__row"><dt>Hạn hoàn thành:</dt><dd>${task.deadline}</dd></div>
            </dl>
            <div>
                <p class="modal__label">Ghi chú chi tiết:</p>
                <p class="modal__note" style="margin-top: 4px;">${task.note}</p>
            </div>
        `;

        // Thay đổi text nút trong modal tùy theo trạng thái hiện tại
        if (task.status === 'completed') {
            modalAdvance.textContent = 'Đã hoàn thành';
            modalAdvance.disabled = true;
        } else {
            modalAdvance.textContent = task.status === 'new' ? 'Nhận nhiệm vụ' : 'Đánh dấu hoàn thành';
            modalAdvance.disabled = false;
        }

        taskModal.hidden = false;
    }

    function closeTaskModal() {
        taskModal.hidden = true;
        currentSelectedTaskId = null;
    }

    modalClose.addEventListener('click', closeTaskModal);
    modalDismiss.addEventListener('click', closeTaskModal);

    // Thao tác chuyển trạng thái trực tiếp từ trong Modal
    modalAdvance.addEventListener('click', () => {
        if (!currentSelectedTaskId) return;
        const task = tasksData.find(t => t.id === currentSelectedTaskId);
        if (task) {
            if (task.status === 'new') {
                updateTaskStatus(task.id, 'processing', 'Minh Anh');
            } else if (task.status === 'processing') {
                updateTaskStatus(task.id, 'completed', 'Minh Anh');
            }
            closeTaskModal();
        }
    });

    // Nút "Làm mới" dữ liệu
    refreshBtn.addEventListener('click', () => {
        taskSearch.value = '';
        filterShift.value = 'all';
        filterPriority.value = 'all';
        filterZone.value = 'all';
        renderBoard(tasksData);
        showToast('Đã làm mới dữ liệu bảng nhiệm vụ!', 'success');
    });

    // Khởi chạy lần đầu tiên khi tải trang
    renderBoard();
});