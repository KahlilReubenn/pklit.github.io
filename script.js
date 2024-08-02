document.addEventListener('DOMContentLoaded', () => {
    const formMasuk = document.getElementById('form-masuk');
    const formPulang = document.getElementById('form-pulang');
    const rekapBtn = document.getElementById('rekap-btn');
    const exportBtn = document.getElementById('export-btn');
    const passwordForm = document.getElementById('password-form');
    const formPassword = document.getElementById('form-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const popup = document.getElementById('popup');

    const soundMasuk = document.getElementById('sound-masuk');
    const soundPulang = document.getElementById('sound-pulang');

    const ADMIN_PASSWORD = 'admin1234'; // Anda bisa mengganti ini dengan password yang lebih aman

    // Update jam dan tanggal
    function updateDateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('current-date').textContent = dateString;
        document.getElementById('current-time').textContent = timeString;
    }

    setInterval(updateDateTime, 1000); // Update setiap detik

    function loadAbsensi() {
        const absensi = JSON.parse(localStorage.getItem('absensi')) || [];
        const daftarAbsensi = document.getElementById('daftar-absensi');
        daftarAbsensi.innerHTML = absensi.map(item => `
            <li>
                ${item.nama} - Sekolah: ${item.sekolah} - Masuk: ${item.masuk} - Pulang: ${item.pulang || 'Belum Pulang'}
            </li>`).join('');
    }

    function saveAbsensi(nama, waktu, jenis, sekolah) {
        const absensi = JSON.parse(localStorage.getItem('absensi')) || [];
        const index = absensi.findIndex(item => item.nama === nama && !item.pulang);
        if (jenis === 'masuk') {
            if (index === -1) {
                absensi.push({ nama, sekolah, masuk: waktu });
            } else {
                absensi[index].masuk = waktu;
                absensi[index].sekolah = sekolah;
            }
            // Mainkan suara absen masuk
            soundMasuk.play();
            // Tampilkan pesan konfirmasi
            showPopup('Absen Masuk berhasil');
        } else if (jenis === 'pulang') {
            if (index !== -1) {
                absensi[index].pulang = waktu;
            } else {
                absensi.push({ nama, sekolah, pulang: waktu });
            }
            // Mainkan suara absen pulang
            soundPulang.play();
            // Tampilkan pesan konfirmasi
            showPopup('Absen Pulang berhasil');
        }
        localStorage.setItem('absensi', JSON.stringify(absensi));
    }

    function showPopup(message) {
        popup.textContent = message;
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000); // Pop-up muncul selama 3 detik
    }

    formMasuk.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('nama-masuk').value;
        const waktu = new Date().toLocaleString();
        const sekolah = document.getElementById('sekolah-masuk').value;
        saveAbsensi(nama, waktu, 'masuk', sekolah);
        loadAbsensi();
        formMasuk.reset();
    });

    formPulang.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('nama-pulang').value;
        const waktu = new Date().toLocaleString();
        const sekolah = document.getElementById('sekolah-pulang').value;
        saveAbsensi(nama, waktu, 'pulang', sekolah);
        loadAbsensi();
        formPulang.reset();
    });

    rekapBtn.addEventListener('click', () => {
        const absensi = JSON.parse(localStorage.getItem('absensi')) || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const filteredAbsensi = absensi.filter(item => {
            const masukDate = new Date(item.masuk);
            return masukDate.getMonth() === currentMonth && masukDate.getFullYear() === currentYear;
        });
        const daftarRekap = document.getElementById('daftar-rekap');
        daftarRekap.innerHTML = filteredAbsensi.map(item => `
            <li>
                ${item.nama} - Sekolah: ${item.sekolah} - Masuk: ${item.masuk} - Pulang: ${item.pulang || 'Belum Pulang'}
            </li>`).join('');
        // Hanya tampilkan tombol "Tampilkan Rekap" ketika rekap absensi ada
        if (filteredAbsensi.length > 0) {
            rekapBtn.style.display = 'block';
        } else {
            rekapBtn.style.display = 'none';
        }
    });

    exportBtn.addEventListener('click', () => {
        passwordForm.style.display = 'block';
    });

    formPassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            passwordForm.style.display = 'none';
            exportToExcel();
        } else {
            errorMessage.style.display = 'block';
        }
    });

    function exportToExcel() {
        const absensi = JSON.parse(localStorage.getItem('absensi')) || [];
        const ws = XLSX.utils.json_to_sheet(absensi);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
        XLSX.writeFile(wb, 'absensi.xlsx');
    }

    loadAbsensi();
});
