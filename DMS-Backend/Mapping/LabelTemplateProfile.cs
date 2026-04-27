using AutoMapper;
using DMS_Backend.Models.DTOs.LabelTemplates;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public class LabelTemplateProfile : Profile
{
    public LabelTemplateProfile()
    {
        CreateMap<LabelTemplate, LabelTemplateListDto>();

        CreateMap<LabelTemplate, LabelTemplateDetailDto>();

        CreateMap<LabelTemplateCreateDto, LabelTemplate>();
        
        CreateMap<LabelTemplateUpdateDto, LabelTemplate>();
    }
}
