// Merge Sort เขียนเอง (ไม่ใช้ Array.prototype.sort)
// เวลา O(n log n) ทุกกรณี, หน่วยความจำเพิ่ม O(n), stable (ลำดับเดิมของค่าเท่ากันไม่เปลี่ยน)
// compare(a, b) คืนค่า <= 0 เมื่อ a ควรมาก่อน b

function merge(left, right, compare) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    // ใช้ <= เพื่อให้ stable: ถ้าเท่ากันให้เอาฝั่งซ้ายก่อน
    if (compare(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

function mergeSort(arr, compare) {
  if (arr.length <= 1) return arr.slice();
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compare);
  const right = mergeSort(arr.slice(mid), compare);
  return merge(left, right, compare);
}

module.exports = { mergeSort };
