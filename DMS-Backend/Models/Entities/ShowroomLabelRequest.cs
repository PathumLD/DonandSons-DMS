using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

/// <summary>
/// Represents showroom label print requests.
/// </summary>
[Table("showroom_label_requests")]
public class ShowroomLabelRequest : BaseEntity
{
    /// <summary>
    /// The outlet/showroom for which labels are being printed.
    /// </summary>
    [Required]
    [Column("outlet_id")]
    public Guid OutletId { get; set; }

    /// <summary>
    /// Text line 1 to print on label (typically showroom code).
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("text_1")]
    public string Text1 { get; set; } = string.Empty;

    /// <summary>
    /// Text line 2 to print on label (custom text).
    /// </summary>
    [MaxLength(100)]
    [Column("text_2")]
    public string? Text2 { get; set; }

    /// <summary>
    /// Number of labels to print.
    /// </summary>
    [Required]
    [Column("label_count")]
    public int LabelCount { get; set; }

    /// <summary>
    /// Date of the print request.
    /// </summary>
    [Required]
    [Column("request_date")]
    public DateTime RequestDate { get; set; }

    // Navigation properties
    public Outlet Outlet { get; set; } = null!;
}
