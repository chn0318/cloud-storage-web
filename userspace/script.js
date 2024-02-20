function displayFileName() {
    const fileUpload = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileUpload.files.length > 0) {
        fileNameDisplay.textContent = fileUpload.files[0].name;
    }
}

function uploadFiles() {
    const token = localStorage.getItem('token');
    const fileUpload = document.getElementById('fileUpload');
    
    if (fileUpload.files.length === 0) {
        alert('Please select a file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileUpload.files[0]); 

    fetch('http://13.57.211.182:8080/api/files/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .then(data => {
        alert(`File uploaded successfully: ${fileUpload.files[0].name}`);
        console.log(data);

        fileUpload.value = '';
        document.getElementById('fileName').textContent = ''; 
        window.location.reload();
    })
    .catch(error => {
        alert('Error uploading file');
        console.error('Error:', error);
    });
}

function deleteFile() {
    const fileUpload = document.getElementById('fileUpload');
    fileUpload.value = ''; 
    document.getElementById('fileName').textContent = ''; 
}


window.onload = function() {
    const token = localStorage.getItem('token');
    const fileList = document.getElementById('fileList');

    document.addEventListener('click', function(e) {
        if (!e.target.matches('li') && !e.target.matches('a')) {
            removeOptions();
        }
    });

    fetch('http://13.57.211.182:8080/api/users/data', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        data.files.forEach(fileObj => {
            const filename = fileObj.Filename;
            const li = document.createElement('li');
            li.textContent = filename;

            // 创建点击事件监听器，仅当点击列表项时展示选项
            li.addEventListener('click', function(e) {
                // 阻止事件冒泡，避免触发文档级的点击事件监听器
                e.stopPropagation();
                
                // 先移除所有其他选项，然后展示当前文件的选项
                removeOptions();

                // 创建下载和删除选项
                const downloadLink = createOptionLink('Download', () => download_File(filename));
                const deleteLink = createOptionLink('Delete', () => delete_File(filename));

                // 添加选项到列表项
                li.appendChild(downloadLink);
                li.appendChild(deleteLink);
            });

            fileList.appendChild(li);
        });
    });
}

function createOptionLink(text, onClickCallback) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = text;
    link.style.marginLeft = '10px'; // 添加样式以区分选项和文件名
    link.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        onClickCallback(); // 调用回调函数
    });
    return link;
}

function removeOptions() {
    // 移除当前显示的所有下载和删除链接
    document.querySelectorAll('#fileList a').forEach(link => {
        link.remove();
    });
}

function download_File(filename) {
    const token = localStorage.getItem('token'); // 从localStorage获取token
    const url = `http://13.57.211.182:8080/api/files/${encodeURIComponent(filename)}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob(); // 将响应体转换为Blob
    })
    .then(blob => {
        // 创建一个临时的URL指向下载的Blob
        const blobUrl = URL.createObjectURL(blob);
        
        // 创建一个隐藏的<a>元素并设置其href为Blob URL
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.setAttribute('download', filename); // 设置下载文件的名称
        document.body.appendChild(downloadLink); // 将<a>元素添加到文档中以使其可以被点击
        
        downloadLink.click(); // 模拟点击<a>元素以触发下载
        
        document.body.removeChild(downloadLink); // 下载后从文档中移除<a>元素
        URL.revokeObjectURL(blobUrl); // 释放Blob URL占用的资源
    })
    .catch(error => {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
    });
}


function delete_File(filename) {
    // 确保你有正确的Token获取方式，这里假设Token存储在localStorage中
    const token = localStorage.getItem('token');
    // 构建API请求的URL，注意替换成你的实际API地址和文件名处理方式
    const url = `http://13.57.211.182:8080/api/files/${encodeURIComponent(filename)}`;

    // 使用fetch发送DELETE请求，包含认证Token
    fetch(url, {
        method: 'DELETE', // 指定请求方法为DELETE
        headers: new Headers({
            'Authorization': `Bearer ${token}` // 包含认证Token
            // 根据你的后端可能需要的其他头部，这里可以添加
        })
    })
    .then(response => {
        if (!response.ok) {
            // 如果服务器响应不是2xx，抛出错误
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json(); // 可以根据需要处理JSON响应
    })
    .then(data => {
        console.log('File deleted successfully:', data);
        alert('File deleted successfully.');
        window.location.reload();
    })
    .catch(error => {
        // 处理错误情况，比如显示错误消息
        console.error('Deletion error:', error);
        alert('An error occurred while deleting the file.');
    });
}

